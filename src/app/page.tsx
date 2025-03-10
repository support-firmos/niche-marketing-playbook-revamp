// src/app/page.tsx
'use client';

import { useState } from 'react';
import ResearchForm from '@/components/ResearchForm';
import ResearchResult from '@/components/ResearchResult';

interface FormData {
  input: string;
}

interface Segment {
  name: string;
  content: string;
}

export default function Home() {
  const [step1GeneratedResearch, setStep1GeneratedResearch] = useState<string | null>(null);
  const [step2EnhancedResearch, setStep2EnhancedResearch] = useState<string | null>(null);
  const [step3GeneratedSalesNav, setStep3GeneratedSalesNav] = useState<string | null>(null);
  const [step3Segments, setStep3Segments] = useState<Segment[] | null>(null);
  const [step4DeepSegmentResearch, setStep4DeepSegmentResearch] = useState<{ displayContent: string | null; originalContent: any } | null>(null);
  const [step5GeneratedPlaybook, setStep5GeneratedPlaybook] = useState<string | null>(null);
  
  const [isGeneratingNextStep, setIsGeneratingNextStep] = useState(false);
  const [currentIndustry, setCurrentIndustry] = useState<string>("");
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
    setCurrentIndustry(formData.input);

    try {
      console.log('Starting segment generation for industry:', formData.input);
      
      // First prompt: Get initial target segments
      const initialResponse = await fetch('/api/generate-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: formData.input }),
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

  const enhanceSegments = async (segments: string, industry: string) => {
    setError(null);
    setIsGeneratingNextStep(true);
    
    try {
      const enhancedResponse = await fetch('/api/enhance-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          industry,
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
          industry: currentIndustry,
          segments 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate sales nav: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Sales Navigator response:', data);
      
      if (!data.result) {
        throw new Error('No result returned from sales navigator generation');
      }
      
      // Format the Sales Navigator content for display
      let formattedContent;
      const rawContent = data.result.content;
      
      // Try to parse the content as JSON
      try {
        const jsonContent = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
        
        if (Array.isArray(jsonContent)) {
          // Format each segment
          formattedContent = jsonContent.map((segment: any, index: number) => {
            const segmentName = segment.name || `Segment ${index + 1}`;
            const segmentContent = segment.content || '';
            
            return `
==========================================
SEGMENT ${index + 1}: ${segmentName.toUpperCase()}
==========================================

${segmentContent}
`;
          }).join('\n\n');
        } else {
          // If it's not an array, just stringify it with pretty formatting
          formattedContent = JSON.stringify(jsonContent, null, 2);
        }
      } catch (e) {
        // If JSON parsing fails, just use the raw content
        console.warn('Failed to parse Sales Navigator content as JSON, using raw content:', e);
        formattedContent = rawContent;
      }
      
      // Store the formatted content for display
      setStep3GeneratedSalesNav(formattedContent);
      
      // Set the segments for deep segment research
      if (data.result.segments && Array.isArray(data.result.segments) && data.result.segments.length > 0) {
        console.log(`Parsed ${data.result.segments.length} segments for deep research`);
        setStep3Segments(data.result.segments);
      } else {
        // Attempt to extract segments from the content if explicit segments aren't provided
        try {
          // Try to parse the sections from the sales nav content
          const content = formattedContent;
          const segments = extractSegmentsFromSalesNav(content);
          
          if (segments.length > 0) {
            console.log(`Extracted ${segments.length} segments from sales nav content`);
            setStep3Segments(segments);
          } else {
            setError('Could not extract segments from the Sales Navigator response. Please try again.');
          }
        } catch (parseError) {
          console.error('Error parsing segments from sales nav content:', parseError);
          setError('Could not parse segments from the Sales Navigator response. Please try again.');
        }
      }
      
    } catch (error) {
      console.error('Error generating Sales Navigator strategy:', error);
      setError('An error occurred while generating the Sales Navigator strategy. Please try again.');
    } finally {
      setIsGeneratingNextStep(false);
    }
  };
  
  // Helper function to extract segments from Sales Navigator content
  const extractSegmentsFromSalesNav = (content: string): Segment[] => {
    const segments: Segment[] = [];
    
    // Look for patterns like "Segment 1: Name" or "1. Name" followed by content
    const segmentRegex = /(?:Segment\s+(\d+):|(\d+)\.)\s+([^\n]+)([\s\S]*?)(?=(?:Segment\s+\d+:|(?:\d+)\.)|$)/g;
    
    let match;
    while ((match = segmentRegex.exec(content)) !== null) {
      const name = match[3]?.trim();
      const segmentContent = match[4]?.trim();
      
      if (name && segmentContent) {
        segments.push({
          name,
          content: segmentContent
        });
      }
    }
    
    return segments;
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
      
      // The API now returns a structured format with all segments
      const resultContent = data.result;
      console.log('Deep segment research content preview:',
        typeof resultContent === 'string'
          ? resultContent.substring(0, 100) + '...'
          : JSON.stringify(resultContent).substring(0, 100) + '...'
      );
      
      // Format the deep segment research for display
      let displayContent;
      if (typeof resultContent === 'string') {
        displayContent = resultContent;
      } else if (resultContent.allSegments && Array.isArray(resultContent.allSegments)) {
        // Format the segments for display
        displayContent = resultContent.allSegments.map((segment: any, index: number) => {
          return `
=================================
DEEP RESEARCH FOR SEGMENT: ${segment.name || `Segment ${index + 1}`}
=================================

${segment.deepResearch || 'No deep research available'}

`;
        }).join('\n\n');
      } else {
        // Fallback to JSON string
        displayContent = JSON.stringify(resultContent, null, 2);
      }
      
      // Store both the formatted content for display and the original result for playbook generation
      setStep4DeepSegmentResearch({
        displayContent,
        originalContent: resultContent
      });
      
      // Remove automatic playbook generation to allow reviewing segments first
      // if (resultContent.combinedResearch) {
      //   await generateMarketingPlaybook(resultContent.combinedResearch);
      // } else {
      //   // If there's no combined research available, pass the display content
      //   await generateMarketingPlaybook(displayContent);
      // }
      
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


  const resetGenerator = () => {
    setStep1GeneratedResearch(null);
    setStep2EnhancedResearch(null);
    setStep3GeneratedSalesNav(null);
    setStep3Segments(null);
    setStep4DeepSegmentResearch(null);
    setStep5GeneratedPlaybook(null);
    setError(null);
    setCurrentIndustry("");
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
      action: (content: string) => enhanceSegments(content, currentIndustry),
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
  return undefined;
};

  return (
    <div className="py-10 px-4 container mx-auto">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#f7f8f8]">Customer Niche Marketing Playbook</h1>
          {/*<p className="text-[#8a8f98]">
            Find ideal Market Segments for Fractional CFO services
          </p>*/}
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-700/30 text-red-300 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        
        <div className="card">
          {displayContent ? (
            <ResearchResult 
              content={displayContent} 
              industry={currentIndustry}
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
  );
}