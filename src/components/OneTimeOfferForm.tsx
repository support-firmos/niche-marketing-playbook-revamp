'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Button from './Button';

interface OneTimeOfferFormProps {
  onSubmit: (fileContent: string) => void;
  isProcessing: boolean;
}

export default function OneTimeOfferForm({ onSubmit, isProcessing }: OneTimeOfferFormProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) {
      setFileName(null);
      setFileContent(null);
      return;
    }

    // Check if file is a text file
    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
      setError('Please upload a text (.txt) file');
      setFileName(null);
      setFileContent(null);
      return;
    }

    setFileName(file.name);
    
    // Read file content
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
    };
    reader.onerror = () => {
      setError('Error reading file');
      setFileContent(null);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!fileContent) {
      setError('Please upload a text file first');
      return;
    }
    
    onSubmit(fileContent);
  };

  const handleReset = () => {
    setFileName(null);
    setFileContent(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-surface-1 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-titleColor mb-6">One-Time Offer Generator</h2>
      
      <div className="mb-6">
        <label htmlFor="textFile" className="block text-[#f7f8f8] font-medium mb-2">
          Upload Text File
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="textFile"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,text/plain"
            className="hidden"
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
          >
            Choose File
          </Button>
          <span className="text-subtitleColor">
            {fileName ? fileName : 'No file chosen'}
          </span>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {fileContent && (
        <div className="mb-6">
          <h3 className="text-[#f7f8f8] font-medium mb-2">File Preview:</h3>
          <div className="bg-surface-2 p-4 rounded-md text-subtitleColor max-h-60 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{fileContent.length > 500 
              ? `${fileContent.substring(0, 500)}...` 
              : fileContent}
            </pre>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!fileContent || isProcessing}
          isLoading={isProcessing}
        >
          Generate One-Time Offer
        </Button>
        <Button
          type="button"
          onClick={handleReset}
          variant="outline"
          disabled={isProcessing}
        >
          Reset
        </Button>
      </div>
    </div>
  );
} 