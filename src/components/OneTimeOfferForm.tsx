'use client';

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from './Button';

interface OneTimeOfferFormProps {
  onSubmit: (content: string) => void;
  isProcessing: boolean;
}

export default function OneTimeOfferForm({ onSubmit, isProcessing }: OneTimeOfferFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile.type !== 'text/plain') {
      setError('Please upload a text (.txt) file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setFileContent(content);
      setFile(selectedFile);
    };
    reader.onerror = () => {
      setError('Error reading the file');
    };
    reader.readAsText(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
    // Clear file association if the user manually edits the text
    if (file) setFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileContent.trim()) {
      setError('Please enter or upload some content');
      return;
    }
    
    onSubmit(fileContent);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-titleColor mb-2">Industry Information</h3>
        <p className="text-subtitleColor mb-6">
          Upload a text file with your industry information or enter it directly in the field below.
        </p>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4
            ${isDragActive 
               ? 'bg-surface-2/30 border-titleColor/60' 
               : 'bg-black/30 border-subtitleColor/30 hover:border-titleColor/40 hover:bg-surface-2/20'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <svg 
              className={`w-12 h-12 mb-3 ${isDragActive ? 'text-titleColor' : 'text-subtitleColor/60'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            
            {file ? (
              <p className="text-subtitleColor">
                <span className="font-medium text-titleColor">{file.name}</span> selected
                <br />
                <span className="text-sm text-subtitleColor/60">Drag a new file or click to replace</span>
              </p>
            ) : (
              <div>
                <p className="text-subtitleColor">
                  {isDragActive ? (
                    "Drop your text file here..."
                  ) : (
                    <>
                      <span className="font-medium text-titleColor">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-xs text-subtitleColor/60 mt-1">
                  Only text (.txt) files are supported
                </p>
              </div>
            )}
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={fileContent}
          onChange={handleTextChange}
          placeholder="Enter your industry information here or upload a file above..."
          className="w-full h-64 px-4 py-3 mb-4 rounded-lg border focus:outline-none resize-none
                     bg-black/30 border-subtitleColor/30 text-titleColor placeholder-subtitleColor/40 
                     focus:border-titleColor/50 focus:ring-1 focus:ring-titleColor/30"
        />

        {error && (
          <div className="bg-black/40 border-l-4 border-red-500 text-subtitleColor p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isProcessing} 
            className="bg-gradient-to-r from-titleColor/90 to-titleColor/60 hover:from-titleColor hover:to-titleColor/80 
                       text-black font-medium px-6 py-3 rounded-lg transition-all shadow-lg 
                       shadow-titleColor/20 hover:shadow-titleColor/30 border border-titleColor/50"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Generate One-Time Offers
              </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 