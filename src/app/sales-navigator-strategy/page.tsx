'use client';

import { useState } from 'react';
import Input from '@/app/sales-navigator-strategy/Input';
import Result from '@/app/sales-navigator-strategy/Result';
import Sidebar from '@/components/Sidebar';
import { useSalesNavSegmentsStore } from '../store/salesNavSegmentsStore';
import Link from 'next/link';

export default function SalesNavigatorStrategy() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayContent, setDisplayContent] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setStep3Segments } = useSalesNavSegmentsStore();

    const salesNavigatorStrategyLLMCall = async (content: string) => {

    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/sales-nav', {
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
      setGeneratedResult(data.result.formattedContent);
      setDisplayContent(true);

      if (data.result.segments && Array.isArray(data.result.segments) && data.result.segments.length > 0) {
        setStep3Segments(data.result.segments);
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
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Your Sales Nav Parameters</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                            Here are your Sales Nav Parameters for each of your segments!
                            </p>
                        </div>
                        </section>
                    ) : (
                        <section className="pt-12 mb-4">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Generate Your Sales Nav Parameters</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                                By the power of AI, you can now determine all the parameters required in order to reach out to your segments. Input your segments below or upload a file!
                            </p>
                        </div>
                        </section>
                    )}
                    <div className='my-5 flex justify-center items-center'>
                        <Link 
                            href="/find-your-segments" 
                            className="text-md text-gray-400 text-green-500 hover:text-green-200 transition-colors duration-200 underline mb-4"
                            >
                            Still haven&apos;t found your segments?
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
                            onSubmit={salesNavigatorStrategyLLMCall}
                            isProcessing={isProcessing}
                        />
                    )}
                </div>
            </div>
        </div>
    </div>
);
}