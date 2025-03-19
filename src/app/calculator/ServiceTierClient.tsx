'use client';
// app/calculator/ServiceTiersClient.tsx
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { usePlaybookStringStore } from '../store/playbookStringStore';
import { useCallback, useMemo } from "react";
import { useServicesStore } from '../store/servicesStore';
import { useRevenueStore } from '../store/revenueStore';
import { useAdvisoriesState } from '../store/twoAdvisoriesStore';

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

export default function ServiceTiersClient() {
  const router = useRouter();
  const {step5StringPlaybook} = usePlaybookStringStore();
  const queryRevenue = useRevenueStore(state => state.revenue);
  const queryServices = useServicesStore(state => state.selectedServices);

  useEffect(() => {
    // If playbook data doesn't exist or is empty, redirect to homepage
    if (!step5StringPlaybook || step5StringPlaybook === '') {
      // Redirect to homepage
      router.push('/service-selection');
    }
  }, [step5StringPlaybook, router]);

  const searchParams = useSearchParams();
  const [revenue, setRevenue] = useState<string>('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [basicPricing, setBasicPricing] = useState<number>(500);

  const {industryAdvisory1, industryAdvisory2, setIndustryAdvisory1, setIndustryAdvisory2 } = useAdvisoriesState();

  const [convertedRevenue, setConvertedRevenue] = useState<number>(0);
  const [standardPricing, setStandardPricing] = useState<number>(0);
  const [premiumPricing, setPremiumPricing] = useState<number>(0);
  const [arrBasic, setArrBasic] = useState<number>(0);
  const [arrStandard, setArrStandard] = useState<number>(0);
  const [arrPremium, setArrPremium] = useState<number>(0);
  const [netRoiBasic, setNetRoiBasic] = useState<number>(0);
  const [netRoiStandard, setNetRoiStandard] = useState<number>(0);
  const [netRoiPremium, setNetRoiPremium] = useState<number>(0);

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
    monthlyBookkeeping: { top: "Monthly", middle: "Monthly", free: "Quarterly" },
    financialStatementPreparation: { top: "Monthly", middle: "Monthly", free: "Quarterly" },
    accountsPayable: { top: true, middle: true, free: false },
    accountsReceivable: { top: true, middle: true, free: false },
    payrollProcessing: { top: true, middle: true, free: false },
    
    // Audit & Assurance
    financialStatementReviews: { top: true, middle: true, free: true },
    internalControlAudits: { top: true, middle: false, free: false },
    aupEngagements: { top: true, middle: false, free: false },
    
    // Regulatory & Entity Compliance
    annualCorporateFilings: { top: true, middle: true, free: true },
    sCorpElection: { top: true, middle: true, free: true },
    registeredAgentFilings: { top: true, middle: true, free: true },
    
    // Specialized Compliance
    nonprofitCompliance: { top: true, middle: false, free: false },
    trustAccounting: { top: true, middle: false, free: false },
    forensicAccounting: { top: true, middle: false, free: false },
    businessValuations: { top: true, middle: false, free: false },
    
    // Advisory
    reviewOfFinancials: { top: true, middle: true, free: true },
    goalAndKPISetting: { top: true, middle: true, free: false },
    cashFlowForecasting: { top: true, middle: false, free: false },
    budgetsAndProjections: { top: true, middle: false, free: false },
    industrySpecificAdvisory1: { top: true, middle: true, free: false },
    industrySpecificAdvisory2: { top: true, middle: true, free: false },

    // Communication - Add missing services
    emailResponseTime: { top: "1 Day", middle: "2 Days", free: "3 Days" },
    zoomCalls: { top: "Unlimited", middle: "Monthly", free: "Quarterly" },
  };

  const serviceCategories: Record<string, string> = {
    businessTaxFiling: "Compliance",
    personalTaxFiling: "Compliance",
    salesTaxCompliance: "Compliance",
    payrollTaxFilings: "Compliance",
    irsTaxNoticeHandling: "Compliance",
    taxFormPreparation: "Compliance",
    
    monthlyBookkeeping: "Compliance",
    financialStatementPreparation: "Compliance",
    accountsPayable: "Compliance",
    accountsReceivable: "Compliance",
    payrollProcessing: "Compliance",
    
    financialStatementReviews: "Compliance",
    internalControlAudits: "Compliance",
    aupEngagements: "Compliance",
    
    annualCorporateFilings: "Compliance",
    sCorpElection: "Compliance",
    registeredAgentFilings: "Compliance",
    
    nonprofitCompliance: "Compliance",
    trustAccounting: "Compliance",
    forensicAccounting: "Compliance",
    businessValuations: "Compliance",

    reviewOfFinancials: "Advisory",
    goalAndKPISetting: "Advisory",
    cashFlowForecasting: "Advisory",
    budgetsAndProjections: "Advisory",
    industrySpecificAdvisory1: "Advisory",
    industrySpecificAdvisory2: "Advisory",

    emailResponseTime: "Communication",
    zoomCalls: "Communication",
  };

  const serviceNames: Record<string, string> = useMemo(() => ({
    businessTaxFiling: "Business Tax Filing",
    personalTaxFiling: "Personal Tax Filing",
    salesTaxCompliance: "Sales & Use Tax Compliance",
    payrollTaxFilings: "Payroll Tax Filings",
    irsTaxNoticeHandling: "IRS/State Tax Notice Handling",
    taxFormPreparation: "1099 & W-2 Preparation",
    
    monthlyBookkeeping: "Bookkeeping & Reconciliation",
    financialStatementPreparation: "Financial Statement Preparation",
    accountsPayable: "Accounts Payable Management",
    accountsReceivable: "Accounts Receivable Management",
    payrollProcessing: "Payroll Processing & Compliance",
    
    financialStatementReviews: "Financial Statement Reviews & Compilations",
    internalControlAudits: "Internal Control & Compliance Audits",
    aupEngagements: "Agreed-Upon Procedures Engagements",
    
    annualCorporateFilings: "Annual Corporate Filings & Business Licensing",
    sCorpElection: "S-Corp Election & Entity Structuring Compliance",
    registeredAgentFilings: "Registered Agent & State Filings",
    
    nonprofitCompliance: "Nonprofit Tax & Compliance",
    trustAccounting: "Trust & Estate Accounting",
    forensicAccounting: "Forensic Accounting & Fraud Investigations",
    businessValuations: "Business Valuations for Compliance Purposes",
    
    reviewOfFinancials: "Review of Financials",
    goalAndKPISetting: "Goal & KPI Setting",
    cashFlowForecasting: "Cash Flow Forecasting",
    budgetsAndProjections: "Budgets & Projections",
    industrySpecificAdvisory1: industryAdvisory1,
    industrySpecificAdvisory2: industryAdvisory2,
  
    emailResponseTime: "Email Response Time",
    zoomCalls: "Zoom Calls (30 min)",
  }), [industryAdvisory1, industryAdvisory2]);

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  // Define which categories and services should always be shown
  const alwaysShowCategories = ["Advisory", "Communication"];
  const alwaysShowServices = [
    // Advisory services
    "reviewOfFinancials", 
    "goalAndKPISetting", 
    "cashFlowForecasting", 
    "budgetsAndProjections", 
    "industrySpecificAdvisory1", 
    "industrySpecificAdvisory2",
    // Communication services
    "emailResponseTime", 
    "zoomCalls"
  ];

   //LLM to generate 2 advisories
   const generateAdvisories = useCallback(
    async (generatedPlaybook: string) => {
      if (!generatedPlaybook || generatedPlaybook === "") {
       // setError("Data from previous step is not successfully read!");
        return;
      }
      console.log("generated playbook: ", generatedPlaybook);
  
      try {
        const response = await fetch("/api/industry-advisory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ generatedPlaybook }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to generate advisories: ${response.status}`);
        }
  
        const advisories = await response.json();
        console.log("advisories: ", advisories);
        console.log("advisories.result: ", advisories.result);
  
        if (advisories.result) {
          const advisoriesPreExtract: string = advisories.result;
          const advisoriesExtracted: string[] = advisoriesPreExtract
            .split(", ")
            .map((word) => word.trim());
  
          if (advisoriesExtracted.length >= 1) {
            setIndustryAdvisory1(advisoriesExtracted[0]);
          }
          if (advisoriesExtracted.length >= 2) {
            setIndustryAdvisory2(advisoriesExtracted[1]);
          }
        } else {
          
        }
      } catch (e) {
        console.error("Error:", e);
      }
    },
    [] // Dependencies go here
  );

  // Add this before your main useEffect
  useEffect(() => {
    // Only call when component first mounts
    if (step5StringPlaybook && industryAdvisory1 === '' && industryAdvisory2 === '' ) {
      generateAdvisories(step5StringPlaybook);
    }
  }, [generateAdvisories, step5StringPlaybook]);

  useEffect(() => {
    // Get the query parameters using useSearchParams
    const parsedRevenue = parseInt(queryRevenue || '0', 10);
    setConvertedRevenue(parsedRevenue);
    
    // Calculate pricing based on basicPricing
    const calculatedStandardPricing = Math.round(basicPricing * 2.5 / 5) * 5;
    setStandardPricing(calculatedStandardPricing);
    
    const calculatedPremiumPricing = Math.round(calculatedStandardPricing * 1.8 / 5) * 5;
    setPremiumPricing(calculatedPremiumPricing);
    
    // Calculate ARR values
    const calculatedArrBasic = basicPricing * 12;
    const calculatedArrStandard = calculatedStandardPricing * 12;
    const calculatedArrPremium = calculatedPremiumPricing * 12;
    
    setArrBasic(calculatedArrBasic);
    setArrStandard(calculatedArrStandard);
    setArrPremium(calculatedArrPremium);
    
    // Calculate Net ROI values
    setNetRoiBasic(calculatedArrBasic - parsedRevenue);
    setNetRoiStandard(calculatedArrStandard - parsedRevenue);
    setNetRoiPremium(calculatedArrPremium - parsedRevenue);
    
    let servicesToUse: ServiceItem[] = [];
    
    if (queryRevenue && queryServices.length > 0) {
      setRevenue(queryRevenue);
      servicesToUse = queryServices.map(service => ({
        id: service.id,
        name: service.label || serviceNames[service.id] || service.id,
        category: serviceCategories[service.id] || "Other"
      }));
    } else {

    // If we don't have data from query params, we'll load all services from tierData
    servicesToUse = Object.keys(tierData)
      .filter(id => !alwaysShowServices.includes(id)) // Exclude services that will be added separately
      .map(id => ({
        id,
        name: serviceNames[id] || id,
        category: serviceCategories[id] || "Other"
      }));
    setRevenue("Not Specified");
    }
    
    // Always add the services from alwaysShowCategories
    const alwaysShownServices = alwaysShowServices.map(id => ({
      id,
      name: serviceNames[id] || id,
      category: serviceCategories[id] || "Other"
    }));
    
    // Combine selected services with always-shown services
    setServices([...servicesToUse, ...alwaysShownServices]);
    
  }, [searchParams, basicPricing, serviceNames]); // Added serviceNames to the dependency array

  useEffect(() => {
    // Only run this effect if industry advisories have been set and services exist
    if ((industryAdvisory1 || industryAdvisory2) && services.length > 0) {
      // Create a new services array with updated names for the industry advisory services
      const updatedServices = services.map(service => {
        if (service.id === 'industrySpecificAdvisory1') {
          return { ...service, name: industryAdvisory1 };
        } else if (service.id === 'industrySpecificAdvisory2') {
          return { ...service, name: industryAdvisory2 };
        }
        return service;
      });
      
      // Update the services state with the new array
      if (JSON.stringify(updatedServices) !== JSON.stringify(services)) {
        setServices(updatedServices);
      }
    }
  }, [industryAdvisory1, industryAdvisory2, services]);


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
      return <span className="text-sm text-gray-400">{value}</span>;
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
    "Advisory",
    "Communication"
  ];

  if (!services.length) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Head>
        <title>Pricing Calculator</title>
      </Head>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Pricing Calculator</h1>
        <p className="text-gray-400">Average Annual Revenue Per Client: ${revenue}</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-800">
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
              
              // Always render categories that should always be shown, even if they have no services
              if (categoryServices.length === 0 && !alwaysShowCategories.includes(category)) {
                return null;
              }
              
              return (
                <React.Fragment key={category}>
                  <tr className="bg-gray-600">
                    <td colSpan={4} className="py-2 px-4 font-semibold border-b">
                      {category}
                    </td>
                  </tr>
                  {categoryServices.map((service, index) => (
                    <tr key={service.id}     className={
                      service.id === 'industrySpecificAdvisory1' || service.id === 'industrySpecificAdvisory2'
                        ? 'bg-slate-900' // Special background for advisory rows
                        : index % 2 === 0 ? 'bg-transparent' : 'bg-transparent'
                    }>
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
            <tr className="bg-gray-600">
              <td colSpan={4} className="py-2 px-4 font-semibold border-b">
                Pricing
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 border-b border-r">Pricing</td>
              <td className="py-3 px-4 text-center border-b border-r">{formatCurrency(premiumPricing)}</td>
              <td className="py-3 px-4 text-center border-b border-r">{formatCurrency(standardPricing)}</td>
              <td className="py-3 px-4 text-center border-b bg-slate-800">
                <input
                  type="number"
                  value={basicPricing}
                  onChange={(e) => setBasicPricing(Number(e.target.value))}
                  className="w-24 text-center bg-transparent"
                />
              </td>
            </tr>
            <tr>
              <td className="py-3 px-4 border-b border-r">ARR</td>
              <td className="py-3 px-4 text-center border-b border-r">{formatCurrency(arrPremium)}</td>
              <td className="py-3 px-4 text-center border-b border-r">{formatCurrency(arrStandard)}</td>
              <td className="py-3 px-4 text-center border-b">{formatCurrency(arrBasic)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 border-b border-r">Average Annual Revenue Per Client</td>
              <td className="py-3 px-4 text-center border-b border-r ">{formatCurrency(convertedRevenue)}</td>
              <td className="py-3 px-4 text-center border-b border-r ">{formatCurrency(convertedRevenue)}</td>
              <td className="py-3 px-4 text-center border-b ">{formatCurrency(convertedRevenue)}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 border-b border-r">Net ROI</td>
              <td className="py-3 px-4 text-center border-b border-r">{formatCurrency(netRoiPremium)}</td>
              <td className="py-3 px-4 text-center border-b border-r">{formatCurrency(netRoiStandard)}</td>
              <td className="py-3 px-4 text-center border-b">{formatCurrency(netRoiBasic)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => router.push('/one-time-offer')}
          className=" text-black px-6 py-2 rounded font-medium hover:bg-blue-700 mr-4 bg-slate-50"
        >
          One Time Offer
        </button>
      </div>
    </div>
  );
}