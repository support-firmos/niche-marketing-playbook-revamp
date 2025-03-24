'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/Button';

export default function LandingPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleSubmit = () => {
    router.push('/marketing-playbook');
  };

  return (
    <div className="relative">
    {/* Fixed position sidebar */}
    <div className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start text-center px-4 py-40">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Transform <span className="text-green-500">client research</span>
          <br />from hours to instants
        </h1>
        
        <p className="text-l mb-12 max-w-xl">
          Uncover <em>niche segments</em>, build targeted <em>Sales Navigator Strategies</em>, and create <em>Inbound Marketing Blueprint</em> in minutes!
        </p>
        
        <Button
          variant='primary'
          onClick={handleSubmit}
          className="px-8 py-3 bg-green-700  rounded-lg hover:bg-slate-800 transition-all"
        >
          Start Research
        </Button>
      </main>
    </div>
    </div>
  );
}