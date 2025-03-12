//app/service-selection/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybookStore } from '../store/playbookStore';


interface ServiceItem {
  id: string;
  label: string;
}

interface ServiceCategory {
  name: string;
  services: ServiceItem[];
}

interface SelectedServices {
  [key: string]: boolean;
}

export default function ServiceSelection() {
  const router = useRouter();
  const step5GeneratedPlaybook = usePlaybookStore(state => state.step5GeneratedPlaybook);

  useEffect(() => {
      // If playbook data doesn't exist or is empty, redirect to homepage
      if (!step5GeneratedPlaybook || step5GeneratedPlaybook === '') {
        // Redirect to homepage
        router.push('/');
      }
    }, [step5GeneratedPlaybook, router]);
  
  const [revenue, setRevenue] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({
    // Tax Services
    businessTaxFiling: false,
    personalTaxFiling: false,
    salesTaxCompliance: false,
    payrollTaxFilings: false,
    irsTaxNoticeHandling: false,
    taxFormPreparation: false,
    // Bookkeeping & Financials
    monthlyBookkeeping: false,
    financialStatementPreparation: false,
    accountsPayable: false,
    accountsReceivable: false,
    payrollProcessing: false,
    // Audit & Assurance
    financialStatementReviews: false,
    internalControlAudits: false,
    aupEngagements: false,
    // Regulatory & Entity Compliance
    annualCorporateFilings: false,
    sCorpElection: false,
    registeredAgentFilings: false,
    // Specialized Compliance
    nonprofitCompliance: false,
    trustAccounting: false,
    forensicAccounting: false,
    businessValuations: false
  });

  // Service definitions with their display names
  const serviceCategories: ServiceCategory[] = [
    {
      name: "Tax Services",
      services: [
        { id: "businessTaxFiling", label: "Business Tax Filing (Corporations, LLCs, Partnerships)" },
        { id: "personalTaxFiling", label: "Personal Tax Filing (Owners & Executives)" },
        { id: "salesTaxCompliance", label: "Sales & Use Tax Compliance" },
        { id: "payrollTaxFilings", label: "Payroll Tax Filings (Federal, State, Local)" },
        { id: "irsTaxNoticeHandling", label: "IRS/State Tax Notice Handling (Response & Resolution)" },
        { id: "taxFormPreparation", label: "1099 & W-2 Preparation" },
      ]
    },
    {
      name: "Bookkeeping & Financials",
      services: [
        { id: "monthlyBookkeeping", label: "Monthly Bookkeeping & Reconciliation" },
        { id: "financialStatementPreparation", label: "Financial Statement Preparation (P&L, Balance Sheet, Cash Flow)" },
        { id: "accountsPayable", label: "Accounts Payable Management (Bill Pay)" },
        { id: "accountsReceivable", label: "Accounts Receivable Management (Invoicing & Collections)" },
        { id: "payrollProcessing", label: "Payroll Processing & Compliance" },
      ]
    },
    {
      name: "Audit & Assurance",
      services: [
        { id: "financialStatementReviews", label: "Financial Statement Reviews & Compilations" },
        { id: "internalControlAudits", label: "Internal Control & Compliance Audits" },
        { id: "aupEngagements", label: "Agreed-Upon Procedures (AUP) Engagements" },
      ]
    },
    {
      name: "Regulatory & Entity Compliance",
      services: [
        { id: "annualCorporateFilings", label: "Annual Corporate Filings & Business Licensing" },
        { id: "sCorpElection", label: "S-Corp Election & Entity Structuring Compliance" },
        { id: "registeredAgentFilings", label: "Registered Agent & State Filings" },
      ]
    },
    {
      name: "Specialized Compliance",
      services: [
        { id: "nonprofitCompliance", label: "Nonprofit Tax & Compliance (Form 990s, Grants)" },
        { id: "trustAccounting", label: "Trust & Estate Accounting" },
        { id: "forensicAccounting", label: "Forensic Accounting & Fraud Investigations" },
        { id: "businessValuations", label: "Business Valuations for Compliance Purposes" },
      ]
    }
  ];

  const handleServiceToggle = (serviceId: string): void => {
    setSelectedServices({
      ...selectedServices,
      [serviceId]: !selectedServices[serviceId]
    });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    // Create an array of selected services
    const servicesArray = Object.entries(selectedServices)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => {
        // Find the service label by id
        const service = serviceCategories.flatMap(cat => cat.services).find(svc => svc.id === id);
        return {
          id,
          name: service?.label || id
        };
      });
    
    // In App Router, we need to encode the data as URL parameters
    const searchParams = new URLSearchParams();
    searchParams.set('revenue', revenue);
    searchParams.set('services', JSON.stringify(servicesArray));
    
    // Navigate to results page with query params
    router.push(`/calculator?${searchParams.toString()}`);
  };

  const isFormValid = Number(revenue) > 0 && Object.values(selectedServices).some(value => value);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="mb-4">
          <label htmlFor="revenue" className="block text-lg font-medium mb-2">
            Average Annual Revenue Per Client ($)
          </label>
          <input
            type="number"
            id="revenue"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            min="0"
            className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
            required
          />
        </div>
        <h1 className="text-2xl font-bold mb-6">Select Services</h1>
        <div className="space-y-6">
          {serviceCategories.map((category, index) => (
            <div key={index} className="border p-4 rounded shadow-sm border-gray-400">
              <h2 className="text-xl font-semibold mb-3">{index + 1}. {category.name}</h2>
              <ul className="space-y-2">
                {category.services.map((service) => (
                  <li key={service.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={service.id}
                      checked={selectedServices[service.id]}
                      onChange={() => handleServiceToggle(service.id)}
                      className="mt-1 mr-2 w-6 h-6"
                    />
                    <label htmlFor={service.id} className="cursor-pointer">
                      {service.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2 rounded font-medium ${
              isFormValid
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Calculate Service
          </button>
        </div>
      </form>
    </div>
  );
}