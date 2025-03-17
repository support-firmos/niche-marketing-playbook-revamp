// src/app/page.tsx
'use client';
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react';
import ResearchForm from '@/components/ResearchForm';
import ResearchResult from '@/components/ResearchResult';
import { usePlaybookStore } from '../store/playbookStore';
import { useRevenueStore } from '../store/revenueStore';
import { useServicesStore } from '../store/servicesStore';
import { useSegmentsStore } from '../store/segmentsStore';
import { useEnhancedStore } from '../store/enhancedStore';
import { useSalesNavStore } from '../store/salesNavStore';
import { useSalesNavSegmentsStore } from '../store/salesNavSegmentsStore';
import { useDeepSegmentResearchStore } from '../store/deepResearchStore';
import Sidebar from "@/components/Sidebar";
import { serialize } from 'v8';

interface FormData {
  nicheConsideration: string;
  profitability: string;
  experience: string;
  clientPercentage: string;
  successStories: string;
  teamSize: number;
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  //new update: service selection prior to the marketing playbook generation:
  const { revenue, setRevenue } = useRevenueStore();
  const { selectedServices, setSelectedServices } = useServicesStore();
  const services = selectedServices
  .map(service => service.label)
  .join(', ');

  useEffect(() => {
    if (!revenue || revenue === '' || !services || services === '') {
      router.push('/');
    }
  }, [revenue, services, router]);

  //using Zustand (global state library) to access this data accross different pages (step5GeneratedPlaybook is needed for Calculator page)
  const { step1GeneratedResearch, setStep1GeneratedResearch } = useSegmentsStore();
  const { step2EnhancedResearch, setStep2EnhancedResearch } = useEnhancedStore();
  const { step3GeneratedSalesNav, setStep3GeneratedSalesNav } = useSalesNavStore();
  const { step3Segments, setStep3Segments } = useSalesNavSegmentsStore();
  const { step4DeepSegmentResearch, setStep4DeepSegmentResearch } = useDeepSegmentResearchStore();
  const { step5GeneratedPlaybook, setStep5GeneratedPlaybook } = usePlaybookStore();
  
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
          teamSize: formData.teamSize,
          services
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
          segments,
          services
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
          segments,
          services
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
        body: JSON.stringify({ segments: step3Segments, services })
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
        segmentInfo: input || step4DeepSegmentResearch,
        services
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

  const goToCalculator = async() => {
    await router.push('/calculator');
  }

  const resetGenerator = () => {

    setRevenue(null);
    setSelectedServices([]);
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
      buttonText: "Enhance Industry Research"
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
      buttonText: "Run Deep Industry Research"
    };
  }
  if (!isStep5Done) {
    return {
      action: () => generateMarketingPlaybook(),
      buttonText: "Generate Inbound Marketing Blueprint"
    };
  }
  if (isStep5Done) {
    return {
      action: () => goToCalculator(),
      buttonText: "Go To Calculator"
    };
  }
  return undefined;
};

return (
  <div className="min-h-screen bg-gradient-to-b from-surface-1 to-black py-10 px-4">
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
        <div className="relative flex">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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
);
}