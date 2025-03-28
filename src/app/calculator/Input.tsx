'use client';

import { useRouter } from 'next/navigation'; // Import useRouter

export default function PlaybookInput() {
  const router = useRouter(); 
  const handleNavigate = () => {
    router.push('/find-your-segments');
  };

  return (
    <div className="bg-black container mx-auto p-4 max-w-4xl flex items-center justify-center">
      <div className="mb-6 bg-black">
        <label 
          htmlFor="marketingPlaybook" 
          className="block text-lg font-medium mb-2 cursor-pointer hover:underline text-blue-500"
          onClick={handleNavigate}
        >
          CLICK HERE to check your services!
        </label>
      </div>
    </div>
  );
}
