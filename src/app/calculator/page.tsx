'use client';
// app/calculator/page.tsx
import { Suspense } from 'react';
import { usePlaybookStore } from '../store/playbookStore';
import { useServicesStore } from '../store/servicesStore';
import ServiceTiersClient from './ServiceTierClient';
import PlaybookInput from './PlaybookInput';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function CalculatorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  // Initialize state to track if component is in client-side rendering
  const [isClient, setIsClient] = useState(false);
  const step5GeneratedPlaybook = usePlaybookStore(state => state.step5GeneratedPlaybook);
  const { selectedServices } = useServicesStore();

  useEffect(() => {
    if(selectedServices.length === 0 || !step5GeneratedPlaybook ){
      router.push('/');
    }
  }, [selectedServices, router]);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only check store state after component has mounted on client
  if (!isClient) {
    return (
      <div className="p-8 text-center">Loading...</div>
    );
  }

  // Conditionally render based on whether playbook data exists
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <div className="relative flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {!step5GeneratedPlaybook || step5GeneratedPlaybook === '' ? (
          <PlaybookInput />
        ) : (
          <ServiceTiersClient />
        )}
      </div>
    </Suspense>
  );
}