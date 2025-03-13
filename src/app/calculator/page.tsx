'use client';
// app/calculator/page.tsx
import { Suspense } from 'react';
import { usePlaybookStore } from '../store/playbookStore';
import ServiceTiersClient from './ServiceTierClient';
import PlaybookInput from './PlaybookInput';
import { useEffect, useState } from 'react';

export default function CalculatorPage() {
  // Initialize state to track if component is in client-side rendering
  const [isClient, setIsClient] = useState(false);
  const step5GeneratedPlaybook = usePlaybookStore(state => state.step5GeneratedPlaybook);

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
      {!step5GeneratedPlaybook || step5GeneratedPlaybook === '' ? (
        <PlaybookInput />
      ) : (
        <ServiceTiersClient />
      )}
    </Suspense>
  );
}