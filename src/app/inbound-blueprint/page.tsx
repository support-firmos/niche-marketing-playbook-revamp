'use client';

import { useState } from 'react';
import Input from '@/app/inbound-blueprint/Input';
import Result from '@/app/inbound-blueprint/Result';
import Sidebar from '@/components/Sidebar';
import { usePlaybookStore } from '../store/playbookStore';
import { usePlaybookStringStore } from '../store/playbookStringStore';
import Link from 'next/link';

export default function InboundBlueprint() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayContent, setDisplayContent] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setStep5GeneratedPlaybook } = usePlaybookStore();
    const { setStep5StringPlaybook } = usePlaybookStringStore();

    const marketingInboundBlueprintLLMCall = async (content: string) => {

    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/playbook', {
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

      if (data.result.playbook && data.result.playbook.length > 0) {
        setStep5GeneratedPlaybook(data.result.playbook);
      } else {
        setError('Playbook not found. Please try again.');
      }

      setStep5StringPlaybook(data.result.formattedContent);
      
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
    <div className="relative bg-black">
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
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Inbound Marketing Blueprint</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                              Here is your Inbound Marketing Blueprint!
                            </p>
                        </div>
                        </section>
                    ) : (
                      <>
                        <section className="pt-12 mb-8">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm"> Inbound Marketing Blueprint</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                              Generate an overarching research that integrates all your target segments in your industry. This research enables deep understanding of the industry landscape.
                            </p>
                        </div>
                        </section>
                        <div className='my-5 flex justify-center items-center'>
                          <Link 
                              href="/deep-research" 
                              className="text-md text-gray-400 text-green-500 hover:text-green-200 transition-colors duration-200 underline mb-4"
                              >
                              Haven&apos;t Done Deep Segment Research yet?
                          </Link>
                         </div>
                      </>
                    )}

                <div className="bg-slate-950 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                    <div></div>
                    {displayContent ? (
                        <Result
                            content={generatedResult || ''}
                            onReset={handleReset}
                        />
                    ) : (
                        <Input 
                            onSubmit={marketingInboundBlueprintLLMCall}
                            isProcessing={isProcessing}
                        />
                    )}
                </div>
            </div>
        </div>
    </div>
);
}