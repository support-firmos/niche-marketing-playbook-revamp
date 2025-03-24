'use client';

import { useState } from 'react';
import { usePlaybookStringStore } from '../store/playbookStringStore';
import Button from '@/components/Button';

export default function PlaybookInput() {
  const {step5StringPlaybook, setStep5StringPlaybook} = usePlaybookStringStore();
  //local
  const [playbookContent, setPlaybookContent] = useState<string>(step5StringPlaybook || '');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setPlaybookContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handlePlaybookChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlaybookContent(e.target.value);
  };

  const handleSubmit = () => {
    if (isFormValid) {
      setStep5StringPlaybook(playbookContent);
    }
  };

  const isFormValid = playbookContent.trim() !== '';

  return (
    <div className="container mx-auto p-4 max-w-4xl">
        
      <div className="mb-6">
        <label htmlFor="marketingPlaybook" className="block text-lg font-medium mb-2">
          Marketing Playbook
        </label>
        <div className="space-y-4">
          <textarea
            id="marketingPlaybook"
            value={playbookContent}
            onChange={handlePlaybookChange}
            className="w-full p-3 border border-gray-300 rounded bg-gray-200 text-black h-36"
            placeholder="Paste your marketing playbook content here..."
            required
          />
          <div className="flex items-center justify-between">
            <input
              type="file"
              id="playbookFile"
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-white hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>
        
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`px-6 py-2 rounded font-medium ${
            isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Calculate Service
        </Button>
      </div>
    </div>
  );
}