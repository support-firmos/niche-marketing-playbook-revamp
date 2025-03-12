// app/calculator/page.tsx
import { Suspense } from 'react';
import ServiceTiersClient from './ServiceTierClient';

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ServiceTiersClient />
    </Suspense>
  );
}