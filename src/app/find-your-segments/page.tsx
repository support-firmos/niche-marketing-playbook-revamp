'use client';

import { useState } from 'react';
import Input from '@/app/find-your-segments/Input';
import Result from '@/app/find-your-segments/Result';
import Sidebar from '@/components/Sidebar';
import { useServicesStore } from '../store/servicesStore';

export default function FindYourSegments() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [displayContent, setDisplayContent] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const findYourSegmentsLLMCall = async (formData: any) => {

    setError(null);
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/generate-segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nicheConsideration: formData.nicheConsideration,
            profitability: formData.profitability,
            experience: formData.experience,
            clientPercentage: formData.clientPercentage,
            successStories: formData.successStories,
            teamSize: formData.teamSize,
            selectedServices: formData.selectedServices
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
                        <section className="py-12">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Your Target Segments</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                            Here are your recommended market segments based on your unique services and expertise.
                            </p>
                        </div>
                        </section>
                    ) : (
                        <section className="py-12 mb-8">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Find Your Segments</h2>
                            <p className="text-subtitleColor max-w-2xl mx-auto text-lg">
                            Check the appropriate services you offer, answer some questions, and you'll be able to find your segments in no time.
                            Determine specific industry segments that would be the best fit for high-ticket, recurring CFO services.
                            </p>
                        </div>
                        </section>
                    )}

                <div className="bg-slate-950 backdrop-blur-sm rounded-xl p-8 shadow-xl">
                    {displayContent ? (
                        <Result
                            content={generatedResult || ''}
                            onReset={handleReset}
                        />
                    ) : (
                        <Input 
                            onSubmit={findYourSegmentsLLMCall}
                            isProcessing={isProcessing}
                        />
                    )}
                </div>
            </div>
        </div>
    </div>
);
}