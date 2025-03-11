'use client';

import { useState } from 'react';
import Button from './Button';

interface OneTimeOfferResultProps {
  content: string;
  onReset: () => void;
}

export default function OneTimeOfferResult({ content, onReset }: OneTimeOfferResultProps) {
  const [copySuccess, setCopySuccess] = useState('');
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch {
      setCopySuccess('Failed to copy');
    }
  };
  
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'One-Time-Offer.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Format the content for display - split by headings
  const formatContentForDisplay = () => {
    // Split the content by headings
    const sections = content.split(/\n\n(?=[A-Z][\w\s]+\n)/g);
    
    return sections.map((section, index) => {
      const lines = section.split('\n');
      const heading = lines[0];
      const content = lines.slice(1).join('\n');
      
      return (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold text-titleColor mb-2">{heading}</h3>
          <div className="whitespace-pre-wrap text-subtitleColor">
            {content}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-titleColor">Generated One-Time Offer</h2>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
          >
            {copySuccess || 'Copy to Clipboard'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
          >
            Download as Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            Start Over
          </Button>
        </div>
      </div>
      
      <div className="bg-surface-1 p-6 rounded-lg shadow-md">
        {formatContentForDisplay()}
      </div>
    </div>
  );
} 