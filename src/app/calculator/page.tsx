'use client';
// app/calculator/page.tsx
import { Suspense } from 'react';
import { usePlaybookStringStore } from '../store/playbookStringStore';
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
  const {step5StringPlaybook} = usePlaybookStringStore();
  const { selectedServices } = useServicesStore();

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
      <div className="relative flex bg-black">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {!selectedServices || selectedServices.length === 0 ? (
          <PlaybookInput />
        ) : (
          <ServiceTiersClient />
        )}
      </div>
    </Suspense>
  );
}