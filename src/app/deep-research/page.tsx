'use client';

import { useState, useEffect } from 'react';
import Input from '@/app/deep-research/Input';
import Result from '@/app/deep-research/Result';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import {useDeepSegmentResearchStore} from '@/app/store/deepResearchStore';
import { useDeepResearchStore, DeepResearchSegment } from '@/app/store/deepResearchStore2';


export default function DeepSegmentResearch() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayContent, setDisplayContent] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<DeepResearchSegment[] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setStep4DeepSegmentResearch } = useDeepSegmentResearchStore();
    const { deepResearchSegments, setDeepResearchSegments } = useDeepResearchStore();

    useEffect(() => {
      if (deepResearchSegments) {
          setGeneratedResult(deepResearchSegments);
          setDisplayContent(true);
      }
  }, [deepResearchSegments]);

    const deepSegmentResearchLLMCall = async (content: string) => {

    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/deep-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            content
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.result.segments && Array.isArray(data.result.segments) && data.result.segments.length > 0) {
        setDeepResearchSegments(data.result.segments);
        setGeneratedResult(data.result.segments);
        setStep4DeepSegmentResearch(data.result.formattedContent);
        setDisplayContent(true);
      }
      
    } catch (error) {
      console.error('Error generating research:', error);
      setError('Failed to generate the research. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setGeneratedResult(null);
    setDeepResearchSegments(null);
    setStep4DeepSegmentResearch(null);
    setDisplayContent(false);
    setError(null);
  };

  return (
    <div className="relative  bg-black">
      {error && (
        <div className="bg-red-900/40 border-l-4 border-red-500 text-white p-4 rounded-md mb-8 shadow-md max-w-3xl mx-auto">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
        {/* Fixed position sidebar */}
        <div className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div className="min-h-screen from-surface-1 bg-black">   
            <div className="max-w-3xl mx-auto relative z-10">
                {/* Conditional Header */}
                {displayContent ? (
                        <section className="pt-12">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Deep Segment Research</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                              Here is an extensive deep segment research based on your segment information.
                            </p>
                        </div>
                        </section>
                    ) : (
                      <>
                        <section className="pt-12 mb-8">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Deep Segment Research</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                              Perform deep research and generate ideas based on given your target segments and their corresponding Sales Navigator Parameters!
                            </p>
                        </div>
                        </section>

                    <div className='my-5 flex justify-center items-center'>
                    <Link 
                        href="/sales-navigator-strategy" 
                        className="text-md text-gray-400 text-green-500 hover:text-green-200 transition-colors duration-200 underline mb-4"
                        >
                        No Target Segments Yet?
                    </Link>
                </div>
                </>
                    )}

                <div className="bg-slate-950 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                    <div></div>
                    {displayContent ? (
                        <Result
                            segments={generatedResult || [] }
                            onReset={handleReset}
                        />
                    ) : (
                        <Input 
                            onSubmit={deepSegmentResearchLLMCall}
                            isProcessing={isProcessing}
                        />
                    )}
                </div>
            </div>
        </div>
    </div>
);
}