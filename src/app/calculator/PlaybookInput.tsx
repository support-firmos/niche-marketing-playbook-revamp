'use client';

import { useRouter } from 'next/navigation'; // Import useRouter

export default function PlaybookInput() {
  const router = useRouter(); 
  const handleNavigate = () => {
    router.push('/find-your-segments');
  };

  return (
    <div className="bg-black container mx-auto p-4 max-w-4xl">
      <div className="mb-6 bg-black">
        <label 
          htmlFor="marketingPlaybook" 
          className="block text-lg font-medium mb-2 cursor-pointer hover:underline text-blue-500"
          onClick={handleNavigate}
        >
          You need to check some services to set up the Pricing Calculator! Click here.
        </label>
      </div>
    </div>
  );
}