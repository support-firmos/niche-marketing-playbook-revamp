'use client';

import { useState } from 'react';
import { usePlaybookStringStore } from '../store/playbookStringStore';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function PlaybookInput() {
  const router = useRouter(); // Initialize the router
  const { step5StringPlaybook, setStep5StringPlaybook } = usePlaybookStringStore();
  // local state
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

  // Function to handle the click and navigate
  const handleNavigate = () => {
    router.push('/find-your-segments'); // Change this to your desired route
  };

  return (
    <div className="bg-black container mx-auto p-4 max-w-4xl">
      <div className="mb-6 bg-black">
        <label 
          htmlFor="marketingPlaybook" 
          className="block text-lg font-medium mb-2 cursor-pointer hover:underline text-blue-500"
          onClick={handleNavigate} // Add onClick handler
        >
          You need to check some services to set up the Pricing Calculator! Click here.
        </label>
      </div>
    </div>
  );
}