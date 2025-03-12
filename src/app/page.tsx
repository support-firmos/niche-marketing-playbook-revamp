// src/app/page.tsx
'use client';
import { useRouter } from 'next/navigation'
import { useState } from 'react';
import Link from 'next/link';
import ResearchForm from '@/components/ResearchForm';
import ResearchResult from '@/components/ResearchResult';
import Button from '@/components/Button';
import { usePlaybookStore } from './store/playbookStore';


interface FormData {
  nicheConsideration: string;
  profitability: string;
  experience: string;
  clientPercentage: string;
  successStories: string;
  teamSize: number;
}

interface Segment {
  name: string;
  content: string;
}

// Define more specific types for various result structures
interface SegmentResearch {
  displayContent: string | null;
  originalContent: Record<string, unknown>;
}

// Define interfaces for structured segment data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SalesNavSegment {
  name?: string;
  content?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DeepResearchSegment {
  name?: string;
  deepResearch?: string;
  [key: string]: unknown;
}

export default function Home() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step1GeneratedResearch, setStep1GeneratedResearch] = useState<string | null>(null);
  const [step2EnhancedResearch, setStep2EnhancedResearch] = useState<string | null>(null);
  const [step3GeneratedSalesNav, setStep3GeneratedSalesNav] = useState<string | null>(null);
  const [step3Segments, setStep3Segments] = useState<Segment[] | null>(null);
  const [step4DeepSegmentResearch, setStep4DeepSegmentResearch] = useState<SegmentResearch | null>(null);

  //using Zustand (global state library) to access this data accross different pages (step5GeneratedPlaybook is needed for Calculator page)
  const setStep5GeneratedPlaybook = usePlaybookStore(state => state.setStep5GeneratedPlaybook);
  const step5GeneratedPlaybook = usePlaybookStore(state => state.step5GeneratedPlaybook);

  const [isGeneratingNextStep, setIsGeneratingNextStep] = useState(false);
  const [currentNiche, setCurrentNiche] = useState<string>("");
  //const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateResearch = async (formData: FormData) => {
    setError(null);
    setStep1GeneratedResearch('');
    setStep2EnhancedResearch(null);
    setStep3GeneratedSalesNav(null);
    setStep3Segments(null);
    setStep4DeepSegmentResearch(null);
    setStep5GeneratedPlaybook(null);
    setCurrentNiche(formData.nicheConsideration.split("\n")[0]); // Use first line of niche description

    try {
      console.log('Starting segment generation with input data');
      
      // First prompt: Get initial target segments
      const initialResponse = await fetch('/api/generate-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicheConsideration: formData.nicheConsideration,
          profitability: formData.profitability,
          experience: formData.experience,
          clientPercentage: formData.clientPercentage,
          successStories: formData.successStories,
          teamSize: formData.teamSize
        }),
      });

      if (!initialResponse.ok) {
        console.error('Error response from generate-segments API:', initialResponse.status);
        const errorData = await initialResponse.text();
        console.error('Error details:', errorData);
        throw new Error(`Failed to generate initial segments: ${initialResponse.status} - ${errorData}`);
      }

      const initialData = await initialResponse.json();
      console.log('API response received');
      
      if (!initialData.result) {
        console.error('No result in API response:', initialData);
        throw new Error('No result returned from segment generation');
      }
      
      const initialSegments = initialData.result;
      console.log('Initial segments generated successfully');
      
      // Display initial results
      setStep1GeneratedResearch(initialSegments);
      
    } catch (error) {
      console.error('Error generating research:', error);
      setError('An error occurred while generating the market research. Please try again.');
      setStep1GeneratedResearch(null);
    } finally {
      //setProgressStatus('');
    }
  };

  const enhanceSegments = async (segments: string, niche: string) => {
    setError(null);
    setIsGeneratingNextStep(true);
    
    try {
      const enhancedResponse = await fetch('/api/enhance-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          niche,
          segments
        }),
      });

      if (!enhancedResponse.ok) {
        throw new Error(`Failed to enhance segments: ${enhancedResponse.status}`);
      }

      const enhancedData = await enhancedResponse.json();
      
      if (enhancedData.result) {
        //setStep1GeneratedResearch(null); // Hide the original research
        setStep2EnhancedResearch(enhancedData.result); // Show enhanced research
      } else {
        setError('Could not enhance the segments. Please try again.');
      }
    } catch (enhanceError) {
      console.error('Error enhancing segments:', enhanceError);
      setError('Could not enhance the segments. Please try again.');
    } finally {
      setIsGeneratingNextStep(false);
    }
  };

  const generateSalesNav = async (segments: string) => {
    setError(null);
    setStep3GeneratedSalesNav('');
    setStep3Segments(null);
    setStep4DeepSegmentResearch(null);
    setStep5GeneratedPlaybook(null);
    setIsGeneratingNextStep(true);

    try {
      const response = await fetch('/api/sales-nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          niche: currentNiche,
          segments 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate sales navigator: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Sales Navigator response:', data);
      
      if (!data.result) {
        throw new Error('No result returned from sales navigator generation');
      }
      
      // Store the formatted content directly from the backend
      setStep3GeneratedSalesNav(data.result.formattedContent || data.result.content);
      
      // Set the segments for deep segment research
      if (data.result.segments && Array.isArray(data.result.segments) && data.result.segments.length > 0) {
        console.log(`Received ${data.result.segments.length} segments for deep research`);
        setStep3Segments(data.result.segments);
      } else {
        setError('No segments were found in the Sales Navigator response. Please try again.');
      }
      
    } catch (error) {
      console.error('Error generating Sales Navigator strategy:', error);
      setError('An error occurred while generating the Sales Navigator strategy. Please try again.');
    } finally {
      setIsGeneratingNextStep(false);
    }
  };

  const generateDeepSegmentResearch = async () => {
    if (!step3Segments || step3Segments.length === 0) {
      setError('No segments available for deep research');
      return;
    }
    
    console.log('Processing all segments for deep research');
    
    setError(null);
    setIsGeneratingNextStep(true);
    
    try {
      // Send the structured segment data to the API
      const response = await fetch('/api/deep-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments: step3Segments })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate deep segment research: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Deep segment research response:', data);
      
      if (!data.result) {
        throw new Error('No result returned from deep segment research');
      }
      
      // The API returns properly formatted content and structured data
      const resultContent = data.result;
      
      // Use the formatted content from the backend if available
      const displayContent = resultContent.formattedContent || 
                           (typeof resultContent === 'string' ? resultContent : JSON.stringify(resultContent, null, 2));
      
      // Store both the display content and the original result for playbook generation
      setStep4DeepSegmentResearch({
        displayContent,
        originalContent: resultContent
      });
      
    } catch (error) {
      console.error('Error generating deep segment research:', error);
      setError('An error occurred while generating the deep segment research. Please try again.');
    } finally {
      setIsGeneratingNextStep(false);
    }
  };

  const generateMarketingPlaybook = async (input?: string) => {
    console.log('Generating marketing playbook');
    setError(null);
    setStep5GeneratedPlaybook('');
    setIsGeneratingNextStep(true);

    try {
      // If no input is provided, use the deep segment research data
      const playbackData = {
        segmentInfo: input || step4DeepSegmentResearch
      };
      
      console.log('Sending data to playbook API:', 
        typeof playbackData.segmentInfo === 'string' 
          ? playbackData.segmentInfo.substring(0, 100) + '...' 
          : 'structured data object'
      );

      const response = await fetch('/api/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playbackData)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate marketing playbook: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('No result returned from marketing playbook generation');
      }
      
      const playbook = data.result;
      setStep5GeneratedPlaybook(playbook);
      
    } catch (error) {
      console.error('Error generating marketing playbook:', error);
      setError('An error occurred while generating the marketing playbook. Please try again.');
    } finally {
      setIsGeneratingNextStep(false);
    }
  };

  const goToServiceSelection = async() => {
    await router.push('/service-selection');
  }

  const resetGenerator = () => {
    setStep1GeneratedResearch(null);
    setStep2EnhancedResearch(null);
    setStep3GeneratedSalesNav(null);
    setStep3Segments(null);
    setStep4DeepSegmentResearch(null);
    setStep5GeneratedPlaybook(null);
    setError(null);
    setCurrentNiche("");
  };

  // Determine which content to show
  
  const displayContent = step5GeneratedPlaybook || 
    (step4DeepSegmentResearch ? 
      (typeof step4DeepSegmentResearch === 'string' ? 
        step4DeepSegmentResearch : 
        (step4DeepSegmentResearch.displayContent || JSON.stringify(step4DeepSegmentResearch, null, 2))
      ) : null) || 
    step3GeneratedSalesNav || 
    step2EnhancedResearch || 
    step1GeneratedResearch;
  const isStep2Done = !!step2EnhancedResearch;
  const isStep3Done = !!step3GeneratedSalesNav;
  const isStep4Done = !!step4DeepSegmentResearch;
  const isStep5Done = !!step5GeneratedPlaybook;

const handleSteps = () => {
  if (!isStep2Done) {
    return {
      action: (content: string) => enhanceSegments(content, currentNiche),
      buttonText: "Enhance Segments"
    };
  }
  if (!isStep3Done) {
    return {
      action: (content: string) => generateSalesNav(content),
      buttonText: "Generate Sales Navigator Strategy"
    };
  }
  if (!isStep4Done) {
    return {
      action: () => generateDeepSegmentResearch(),
      buttonText: "Run Deep Segment Research"
    };
  }
  if (!isStep5Done) {
    return {
      action: () => generateMarketingPlaybook(),
      buttonText: "Generate Marketing Playbook"
    };
  }
  if (isStep5Done) {
    return {
      action: () => goToServiceSelection(),
      buttonText: "Go To Calculator"
    };
  }
  return undefined;
};

return (
  <div className="min-h-screen bg-gradient-to-b from-surface-1 to-black py-10 px-4">
    <div className="container mx-auto flex flex-col md:flex-row gap-6 relative">
      {/* Sidebar toggle button (always visible) */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-0 left-0 z-10 p-2 bg-surface-1/60 rounded-lg shadow-md text-titleColor hover:bg-surface-1/80 transition-all duration-200"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? (
          // X icon when open
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Menu icon when closed
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {/* Collapsible Sidebar */}
      <div className={`md:w-64 bg-surface-1/40 border border-subtitleColor/10 rounded-xl p-6 shadow-lg h-fit transition-all duration-300 ease-in-out ${
        sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full md:opacity-0 md:-translate-x-full absolute"
      }`}>
        <div className="flex flex-col gap-4 pt-8">
          <Link href="/one-time-offer">
            <Button 
              className="!bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black font-medium shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80 border border-titleColor/50 !py-3 !px-5 w-full"
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                One-Time Offer Generator
              </span>
            </Button>
          </Link>

          <Link href="/service-selection">
            <Button 
              className="!bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black font-medium shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80 border border-titleColor/50 !py-3 !px-5 w-full"
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Three-Tier Calculator
              </span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-0" : "ml-0"}`}>
        {/* Header with just the title now */}
        <header className="flex justify-center items-center mb-12 mt-10 md:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-titleColor">
            Customer Niche Marketing Playbook
          </h1>
        </header>
        
        {error && (
          <div className="bg-black/40 border-l-4 border-red-500 text-subtitleColor p-4 rounded mb-8 shadow-md">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          <div className="card bg-surface-1/30 border border-subtitleColor/10 rounded-xl p-6 shadow-lg">
            {displayContent ? (
              <ResearchResult 
                content={displayContent} 
                industry={currentNiche}
                onReset={resetGenerator}
                onNextSteps={handleSteps()?.action}
                nextStepButtonText={handleSteps()?.buttonText}
                isGeneratingNextStep={isGeneratingNextStep}
                resultType={step5GeneratedPlaybook ? 'playbook' : step4DeepSegmentResearch ? 'deepSegment' : step3GeneratedSalesNav ? 'salesNav' : step2EnhancedResearch ? 'enhanced' : 'segments'}
                segments={step3Segments || []}
              />
            ) : (
              <ResearchForm onSubmit={generateResearch} />
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}