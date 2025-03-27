'use client';

import { useState } from 'react';
import Input from '@/app/deep-research/Input';
import Result from '@/app/deep-research/Result';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function DeepSegmentResearch() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayContent, setDisplayContent] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
      setGeneratedResult(data.result);
      setDisplayContent(true);
    } catch (error) {
      console.error('Error generating research:', error);
      setError('Failed to generate the research. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setGeneratedResult(null);
    setDisplayContent(false);
    setError(null);
  };

  return (
    <div className="relative">
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
                              Here is an extensive deep segment research based on your segment information, parameters, and keywords.
                            </p>
                        </div>
                        </section>
                    ) : (
                        <section className="pt-12 mb-8">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Deep Segment Research</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                              Perform deep research and generate ideas based on given ICP parameters. 
                            </p>
                        </div>
                        </section>
                    )}
                    <div className='my-5 flex justify-center items-center'>
                        <Link 
                            href="/sales-navigator-strategy" 
                            className="text-md text-gray-400 text-green-500 hover:text-green-200 transition-colors duration-200 underline mb-4"
                            >
                            No Sales Nav Parameters yet?
                        </Link>
                    </div>

                <div className="bg-slate-950 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                    <div></div>
                    {displayContent ? (
                        <Result
                            content={generatedResult || ''}
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