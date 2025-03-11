'use client';
// pages/service-tiers.tsx
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface ServiceItem {
  id: string;
  name: string;
  category?: string;
}

interface TierStatus {
  top: string | boolean;
  middle: string | boolean;
  free: string | boolean;
}

interface TierData {
  [key: string]: TierStatus;
}

export default function ServiceTiers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [revenue, setRevenue] = useState<string>('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  
  // Updated tier data based on the provided image
  const tierData: TierData = {
    // Compliance
    businessTaxFiling: { top: true, middle: true, free: true },
    personalTaxFiling: { top: true, middle: true, free: true },
    salesTaxCompliance: { top: true, middle: true, free: true },
    payrollTaxFilings: { top: true, middle: true, free: true },
    irsTaxNoticeHandling: { top: true, middle: true, free: false },
    taxFormPreparation: { top: true, middle: true, free: true },
    
    // Bookkeeping & Financials
    bookkeepingAndReconciliation: { top: "Monthly", middle: "Monthly", free: "Quarterly" },
    financialStatementPreparation: { top: "Monthly", middle: "Monthly", free: "Quarterly" },
    accountsPayable: { top: true, middle: true, free: false },
    accountsReceivable: { top: true, middle: true, free: false },
    payrollProcessing: { top: true, middle: true, free: false },
    
    // Audit & Assurance
    auditReviews: { top: true, middle: true, free: true },
    internalControlAudits: { top: true, middle: false, free: false },
    aupEngagements: { top: true, middle: false, free: false },
    
    // Regulatory & Entity Compliance
    annualCorporateFilings: { top: true, middle: true, free: true },
    sCorpElection: { top: true, middle: true, free: true },
    registeredAgentFilings: { top: true, middle: true, free: true },
    
    // Specialized Compliance
    nonprofitCompliance: { top: true, middle: false, free: false },
    trustAndEstateAccounting: { top: true, middle: false, free: false },
    forensicAccounting: { top: true, middle: false, free: false },
    businessValuations: { top: true, middle: false, free: false },
    
    // Advisory
    reviewOfFinancials: { top: true, middle: true, free: true },
    goalAndKPISetting: { top: true, middle: true, free: false },
    cashFlowForecasting: { top: true, middle: false, free: false },
    budgetsAndProjections: { top: true, middle: false, free: false },
    industrySpecificAdvisory1: { top: true, middle: true, free: false },
    industrySpecificAdvisory2: { top: true, middle: true, free: false },
  };

  // Service categories mapping
  const serviceCategories: Record<string, string> = {
    businessTaxFiling: "Compliance",
    personalTaxFiling: "Compliance",
    salesTaxCompliance: "Compliance",
    payrollTaxFilings: "Compliance",
    irsTaxNoticeHandling: "Compliance",
    taxFormPreparation: "Compliance",
    
    monthlyBookkeeping: "Bookkeeping & Reconciliation",
    financialStatementPreparation: "Bookkeeping & Reconciliation",
    accountsPayable: "Bookkeeping & Reconciliation",
    accountsReceivable: "Bookkeeping & Reconciliation",
    payrollProcessing: "Bookkeeping & Reconciliation",
    
    financialStatementReviews: "Audit & Assurance",
    internalControlAudits: "Audit & Assurance",
    aupEngagements: "Audit & Assurance",
    
    annualCorporateFilings: "Regulatory & Entity Compliance",
    sCorpElection: "Regulatory & Entity Compliance",
    registeredAgentFilings: "Regulatory & Entity Compliance",
    
    nonprofitCompliance: "Specialized Compliance",
    trustAccounting: "Specialized Compliance",
    forensicAccounting: "Specialized Compliance",
    businessValuations: "Specialized Compliance",

  };

  // Service names mapping
  const serviceNames: Record<string, string> = {
    businessTaxFiling: "Business Tax Filing",
    personalTaxFiling: "Personal Tax Filing",
    salesAndUseTaxCompliance: "Sales & Use Tax Compliance",
    payrollTaxFilings: "Payroll Tax Filings",
    irsTaxNoticeHandling: "IRS/State Tax Notice Handling",
    taxFormPreparation: "1099 & W-2 Preparation",
    
    bookkeepingAndReconciliation: "Bookkeeping & Reconciliation",
    financialStatementPreparation: "Financial Statement Preparation",
    accountsPayable: "Accounts Payable Management",
    accountsReceivable: "Accounts Receivable Management",
    payrollProcessing: "Payroll Processing & Compliance",
    
    auditReviews: "Audit Reviews & Compilations",
    internalControlAudits: "Internal Control & Compliance Audits",
    aupEngagements: "Agreed-Upon Procedures Engagements",
    
    annualCorporateFilings: "Annual Corporate Filings & Business Licensing",
    sCorpElection: "S-Corp Election & Entity Structuring Compliance",
    registeredAgentFilings: "Registered Agent & State Filings",
    
    nonprofitCompliance: "Nonprofit Tax & Compliance",
    trustAndEstateAccounting: "Trust & Estate Accounting",
    forensicAccounting: "Forensic Accounting & Fraud Investigations",
    businessValuations: "Business Valuations for Compliance Purposes",
    
    reviewOfFinancials: "Review of Financials",
    goalAndKPISetting: "Goal & KPI Setting",
    cashFlowForecasting: "Cash Flow Forecasting",
    budgetsAndProjections: "Budgets & Projections",
    industrySpecificAdvisory1: "Industry-Specific Advisory",
    industrySpecificAdvisory2: "Industry-Specific Advisory",
  };

  useEffect(() => {
    // Get the query parameters using useSearchParams
    const queryRevenue = searchParams.get('revenue');
    const queryServices = searchParams.get('services');
    
    if (queryRevenue && queryServices) {
      setRevenue(queryRevenue);
      try {
        const parsedServices = JSON.parse(queryServices);
        // If the parsed services doesn't include categories, add them
        const enhancedServices = parsedServices.map((service: ServiceItem) => ({
          ...service,
          category: serviceCategories[service.id] || "Other",
          // If a service name is not provided, use the one from our mapping
          name: service.name || serviceNames[service.id] || service.id
        }));
        setServices(enhancedServices);
      } catch (error) {
        console.error("Failed to parse services:", error);
      }
    } else {
      // If we don't have data from query params, we'll use all services for demo
      const allServices = Object.keys(tierData).map(id => ({
        id,
        name: serviceNames[id] || id,
        category: serviceCategories[id] || "Other"
      }));
      setServices(allServices);
      setRevenue("Not Specified");
    }
  }, [searchParams]); // Only depend on searchParams now

  // Helper function to render tier cell content
  const renderTierCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      if (value) {
        return (
          <div className="flex justify-center">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      }
    } else {
      return <span className="text-sm">{value}</span>;
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc: Record<string, ServiceItem[]>, service) => {
    const category = service.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  // Categories in desired order
  const categoryOrder = [
    "Compliance", 
    "Bookkeeping & Reconciliation", 
    "Audit & Assurance", 
    "Regulatory & Entity Compliance", 
    "Specialized Compliance", 
    "Advisory",
    "Other"
  ];

  if (!services.length) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Head>
        <title>Service Tier Recommendations</title>
      </Head>
      
      <div className="mb-6">
        <Link href="/service-selection" className="text-blue-600 hover:underline">
          ← Back to Selection
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Service Tier Recommendations</h1>
        <p className="text-gray-600">Based on Annual Revenue: ${revenue}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b border-r">Service Category</th>
              <th className="py-3 px-4 text-center border-b border-r">
                <div className="font-bold">Top Tier</div>
                <div className="text-sm text-gray-500">(Premium)</div>
              </th>
              <th className="py-3 px-4 text-center border-b border-r">
                <div className="font-bold">Middle Tier</div>
                <div className="text-sm text-gray-500">(Standard)</div>
              </th>
              <th className="py-3 px-4 text-center border-b">
                <div className="font-bold">Bottom Tier</div>
                <div className="text-sm text-gray-500">(Basic)</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {categoryOrder.map(category => {
              const categoryServices = groupedServices[category] || [];
              if (categoryServices.length === 0) return null;
              
              return (
                <React.Fragment key={category}>
                  <tr className="bg-gray-200">
                    <td colSpan={4} className="py-2 px-4 font-semibold border-b">
                      {category}
                    </td>
                  </tr>
                  {categoryServices.map((service, index) => (
                    <tr key={service.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b border-r">{service.name}</td>
                      <td className="py-3 px-4 text-center border-b border-r">
                        {renderTierCell(tierData[service.id]?.top)}
                      </td>
                      <td className="py-3 px-4 text-center border-b border-r">
                        {renderTierCell(tierData[service.id]?.middle)}
                      </td>
                      <td className="py-3 px-4 text-center border-b">
                        {renderTierCell(tierData[service.id]?.free)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 mr-4"
        >
          Print Results
        </button>
        <Link 
          href="/service-selection"
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300"
        >
          Start Over
        </Link>
      </div>
    </div>
  );
}