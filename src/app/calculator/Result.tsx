'use client';
// app/calculator/ServiceTiersClient.tsx
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useMemo } from "react";
import { useServicesStore } from '../store/servicesStore';
import { useRevenueStore } from '../store/revenueStore';
import { useAdvisoriesState } from '../store/twoAdvisoriesStore';
import Button from '@/components/Button';
import { ExportToExcel } from '@/app/calculator/exportToExcel'; 
import { usePlaybookStringStore } from '../store/playbookStringStore';

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

export default function Result() {
  const router = useRouter();
  const {step5StringPlaybook} = usePlaybookStringStore();
  const queryRevenue: number | null = useRevenueStore(state => state.revenue);
  const queryServices = useServicesStore(state => state.selectedServices);

  // useEffect(() => {
  //   if (!step5StringPlaybook || step5StringPlaybook === '') {
  //     router.push('/service-selection');
  //   }
  // }, [step5StringPlaybook, router]);

  const searchParams = useSearchParams();
  const [revenue, setRevenue] = useState<number>(0);
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
    nicheSpecificAdvisory1: { top: true, middle: true, free: false },
    nicheSpecificAdvisory2: { top: true, middle: true, free: false },

    // Communication - Add missing services
    emailResponseTime: { top: "24 hours", middle: "48 hours", free: "1 week" },
    zoomCalls: { top: "Bi-weekly", middle: "Monthly", free: "Quarterly" },
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
    nicheSpecificAdvisory1: "Advisory",
    nicheSpecificAdvisory2: "Advisory",

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
    nicheSpecificAdvisory1: industryAdvisory1,
    nicheSpecificAdvisory2: industryAdvisory2,
  
    emailResponseTime: "Email Response Time",
    zoomCalls: "Zoom Calls (30 min)",
  }), [industryAdvisory1, industryAdvisory2]);

  const alwaysShowCategories = ["Advisory", "Communication"];
  const alwaysShowServices = [
    "reviewOfFinancials", 
    "goalAndKPISetting", 
    "cashFlowForecasting", 
    "budgetsAndProjections", 
    "nicheSpecificAdvisory1", 
    "nicheSpecificAdvisory2",
    "emailResponseTime", 
    "zoomCalls"
  ];

  //  //LLM to generate 2 advisories
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
        }
      } catch (e) {
        console.error("Error:", e);
      }
    },
    [] // Dependencies go here
  );

  useEffect(() => {
    // Uncomment the following line to get the playbook string from the store
    // const step5StringPlaybook = usePlaybookStringStore(state => state.step5StringPlaybook);
    
    // If you have the playbook string and advisories are not set yet, generate them
    if (step5StringPlaybook && industryAdvisory1 === '' && industryAdvisory2 === '') {
      generateAdvisories(step5StringPlaybook);
    }
  }, [generateAdvisories, step5StringPlaybook, industryAdvisory1, industryAdvisory2]);

  useEffect(() => {
    // Get the query parameters using useSearchParams
    const parsedRevenue = queryRevenue || 0;
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
    setRevenue(0);
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
        if (service.id === 'nicheSpecificAdvisory1') {
          return { ...service, name: industryAdvisory1 };
        } else if (service.id === 'nicheSpecificAdvisory2') {
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
    <div className="container mx-auto p-4 max-w-5xl items-center justify-center">
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
              <th className="py-3 px-4 text-left border-b border-r h-20">Service Category</th>
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
                  {categoryServices.map((service) => (
                    <tr key={service.id}     className={
                      service.id === 'nicheSpecificAdvisory1' || service.id === 'nicheSpecificAdvisory2'
                        ? 'bg-transparent' // Special background for advisory rows
                        : 'bg-transparent'
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
          {/* New pricing rows */}
                    {/* Visual spacer row before Pricing */}
                    <tr className="h-20"> {/* This adds empty space */}
            <td colSpan={4}></td>
          </tr>
          <tr className="bg-gray-600">
            <td colSpan={4} className="py-2 h-20 px-4 font-semibold border-b bg-slate-800">
              ROI Calculator
            </td>
          </tr>
          <tr className = ''>
            <td className="py-3 px-4 border-b border-r">Monthly Subscription</td>
            <td className="py-3 px-4 text-center border-b border-r">${premiumPricing}</td>
            <td className="py-3 px-4 text-center border-b border-r">${standardPricing}</td>
            <td className="py-3 px-4 text-center border-b">
              <input
                type="number"
                value={basicPricing}
                onChange={(e) => setBasicPricing(Number(e.target.value))}
                className="w-20 text-center text-black bg-white border-2 rounded-sm"
                min="0"
                step="5"
              />
            </td>
          </tr>
          <tr className = ''>
            <td className="py-3 px-4 border-b border-r">Annual Recurring Revenue (ARR) Per Client</td>
            <td className="py-3 px-4 text-center border-b border-r">${arrPremium.toLocaleString()}</td>
            <td className="py-3 px-4 text-center border-b border-r">${arrStandard.toLocaleString()}</td>
            <td className="py-3 px-4 text-center border-b">${arrBasic.toLocaleString()}</td>
          </tr>
          <tr className = ''>
            <td className="py-3 px-4 border-b border-r">Current Average ARR Per Client</td>
            <td className="py-3 px-4 text-center border-b border-r">${convertedRevenue.toLocaleString()}</td>
            <td className="py-3 px-4 text-center border-b border-r">${convertedRevenue.toLocaleString()}</td>
            <td className="py-3 px-4 text-center border-b">${convertedRevenue.toLocaleString()}</td>
          </tr>
          <tr className="bg-green-900">
            <td className="py-3 px-4 border-b border-r relative group">
              Net Annual Gain From Service Repackaging
            </td>
            <td className="py-3 px-4 text-center border-b border-r">${netRoiPremium.toLocaleString()}</td>
            <td className="py-3 px-4 text-center border-b border-r">${netRoiStandard.toLocaleString()}</td>
            <td className="py-3 px-4 text-center border-b">${netRoiBasic.toLocaleString()}</td>
          </tr>
          </tbody>
        </table>
        <div className="text-xs text-gray-300 py-4">
          Your Net Annual Gain represents the additional revenue generated by repackaging your current service offerings. It showcases the potential financial uplift from strategic pricing and service optimization.
        </div>
      </div>
      
      <div className="mt-8 text-center flex items-center gap-4">

        <Button 
          variant='primary'
          onClick={() => router.push('/one-time-offer')}
        >
          One Time Offer
        </Button>
        
        <ExportToExcel 
          services={services}
          tierData={tierData}
          serviceNames={serviceNames}
          pricingData={{
            basicPricing,
            standardPricing,
            premiumPricing,
            arrBasic,
            arrStandard,
            arrPremium,
            convertedRevenue,
            netRoiBasic,
            netRoiStandard,
            netRoiPremium
          }}
        />
      </div>
    </div>
  );
}