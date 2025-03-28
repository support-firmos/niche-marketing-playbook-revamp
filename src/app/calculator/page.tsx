'use client';
// app/calculator/page.tsx
import { Suspense } from 'react';
import { useServicesStore } from '../store/servicesStore';
import ServiceTiersClient from './ServiceTierClient';
import PlaybookInput from './PlaybookInput';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function CalculatorPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { selectedServices } = useServicesStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="p-8 text-center">Loading...</div>
    );
  }

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