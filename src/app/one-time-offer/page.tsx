'use client';

import { useState } from 'react';
import Link from 'next/link';
import OneTimeOfferForm from '@/components/OneTimeOfferForm';
import OneTimeOfferResult from '@/components/OneTimeOfferResult';
import Button from '@/components/Button';

export default function OneTimeOfferPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (fileContent: string) => {
    setError(null);
    setIsProcessing(true);
    
    try {
      // Call the API route instead of directly calling the service
      const response = await fetch('/api/one-time-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: fileContent }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setGeneratedResult(data.result);
    } catch (error) {
      console.error('Error generating one-time offer:', error);
      setError('Failed to generate the one-time offer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setGeneratedResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-1 to-black">
      {/* Header with Navigation */}
      <header className="border-b border-subtitleColor/10 backdrop-blur-md bg-black/80 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            <span className="text-titleColor">One-Time Offer</span>
            <span className="text-subtitleColor"> Generator</span>
          </h1>
          <Link href="/">
            <Button variant="secondary" size="md" className="shadow-sm border border-subtitleColor/30 !bg-black hover:!bg-surface-1">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </span>
            </Button>
          </Link>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-titleColor mb-4 drop-shadow-sm">Generate Compelling One-Time Offers</h2>
          <p className="text-subtitleColor max-w-2xl mx-auto text-lg mb-8">
            Transform your business insights into persuasive one-time offers that convert prospects into loyal customers. 
            Simply upload your industry information and let our AI do the rest.
          </p>
          <div className="w-24 h-1 bg-titleColor/70 mx-auto rounded-full"></div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16 max-w-5xl">
        {error && (
          <div className="bg-black/40 border-l-4 border-red-500 text-subtitleColor p-4 rounded mb-8 shadow-md" role="alert">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}
        
        <div className="bg-surface-1/60 backdrop-blur-sm rounded-xl shadow-xl border border-subtitleColor/10 overflow-hidden">
          {!generatedResult ? (
            <OneTimeOfferForm 
              onSubmit={handleSubmit} 
              isProcessing={isProcessing} 
            />
          ) : (
            <OneTimeOfferResult 
              content={generatedResult} 
              onReset={handleReset}
            />
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t border-subtitleColor/10 bg-black/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-subtitleColor/70 text-sm">
          <p>Powered by AI technology to create industry-specific one-time offers.</p>
        </div>
      </footer>
    </div>
  );
} 