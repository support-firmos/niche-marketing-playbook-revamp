'use client';

import { useState } from 'react';
import Link from 'next/link';
import OneTimeOfferForm from '@/components/OneTimeOfferForm';
import OneTimeOfferResult from '@/components/OneTimeOfferResult';
import Button from '@/components/Button';
import { generateOneTimeOffer } from '@/lib/oneTimeOfferService';

export default function OneTimeOfferPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (fileContent: string) => {
    setError(null);
    setIsProcessing(true);
    
    try {
      const result = await generateOneTimeOffer(fileContent);
      setGeneratedResult(result);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-titleColor">One-Time Offer Generator</h1>
        <Link href="/">
          <Button variant="outline">
            Back to Home
          </Button>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
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
  );
} 