'use client';

import { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '@/components/Button';

interface InputProps {
  onSubmit: (content: string) => Promise<void>;
  isProcessing: boolean;
}

export default function Input({ onSubmit, isProcessing }: InputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) return;
    
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
    const newContent = e.target.value;
    setFileContent(newContent);
    if (file) setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileContent.trim()) {
      setError('Please enter or upload some content');
      return;
    }

    await onSubmit(fileContent);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
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
              className={`w-12 h-10 mb-3 ${isDragActive ? 'text-titleColor' : 'text-subtitleColor/60'}`} 
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
              </p>
            ) : (
              <div>
                <p className="text-subtitleColor">
                  {isDragActive ? (
                    "Drop your text file here..."
                  ) : (
                    <>
                      <span className="font-medium text-titleColor">Upload Your Deep Segment Research</span>
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
          placeholder="Paste your deep segment research"
          className="w-full h-64 px-4 py-3 mb-4 rounded-lg border focus:outline-none resize-none
                     bg-black/30 border-subtitleColor/30 text-titleColor placeholder-subtitleColor/40 
                     focus:border-titleColor/50 focus:ring-1 focus:ring-titleColor/30"
        />

        {error && (
          <div className="bg-black/40 border-l-4 border-red-500 text-subtitleColor p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isProcessing} 
            className={`
              bg-green-700 hover:bg-green-800 text-white font-medium text-base rounded-md 
              !py-2 !px-4 transition-all duration-300 
              disabled:bg-gray-600 disabled:cursor-not-allowed
            `}
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
                Inbound Marketing Blueprint
              </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}