//app/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRevenueStore } from './store/revenueStore';
import { useServicesStore } from './store/servicesStore'
import Link from 'next/link';
import Button from '@/components/Button';

interface ServiceItem {
  id: string;
  label: string;
}

interface ServiceCategory {
  name: string;
  services: ServiceItem[];
}

export default function ServiceSelection() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { setSelectedServices } = useServicesStore();
  const { revenue, setRevenue } = useRevenueStore();
  const [localSelectedServices, setLocalSelectedServices] = useState<Record<string, boolean>>({});

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
    setLocalSelectedServices({
      ...localSelectedServices,
      [serviceId]: !localSelectedServices[serviceId]
    });
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const selectedServicesArray = Object.entries(localSelectedServices)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => {
        const service = serviceCategories.flatMap(cat => cat.services).find(svc => svc.id === id);
        return { id, label: service?.label || id };
      });
  
    setSelectedServices(selectedServicesArray);
    setRevenue(revenue);
    
    router.push('/marketing-playbook');
  };

  const isFormValid = Number(revenue) > 0 && Object.values(localSelectedServices).some(value => value);

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-1 to-black py-10 px-4">
      <div className="container mx-auto flex flex-col md:flex-row gap-6 relative">
        {/* Sidebar toggle button (always visible) */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-0 left-0 z-10 p-2 bg-surface-1/60 rounded-lg shadow-md text-titleColor hover:bg-surface-1/80 transition-all duration-200"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            // X icon when open
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Menu icon when closed
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        
        {/* Collapsible Sidebar */}
        <div className={`md:w-64 bg-surface-1/40 border border-subtitleColor/10 rounded-xl p-6 shadow-lg h-fit transition-all duration-300 ease-in-out ${
          sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full md:opacity-0 md:-translate-x-full absolute"
        }`}>
          <div className="flex flex-col gap-4 pt-8">
            <Link href="/one-time-offer">
              <Button 
                className="!bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black font-medium shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80 border border-titleColor/50 !py-3 !px-5 w-full"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  One-Time Offer Generator
                </span>
              </Button>
            </Link>
  
           {/*} <Link href="/calculator">
              <Button 
                className="!bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black font-medium shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80 border border-titleColor/50 !py-3 !px-5 w-full"
              >
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  Three-Tier Calculator
                </span>
              </Button>
            </Link> */}
          </div>
        </div>
  
        {/* Main Content */}
        <div className="flex-1 md:ml-4 flex justify-center">
          <div className="bg-surface-1/40 border border-subtitleColor/10 rounded-xl p-6 shadow-lg max-w-5xl">
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
                  <div key={index} className="border p-4 rounded shadow-sm border-gray-400 bg-surface-1/30">
                    <h2 className="text-xl font-semibold mb-3">{index + 1}. {category.name}</h2>
                    <ul className="space-y-2">
                      {category.services.map((service) => (
                        <li key={service.id} className="flex items-start">
                          <input
                            type="checkbox"
                            id={service.id}
                            checked={!!localSelectedServices[service.id]}
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
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isFormValid
                      ? 'bg-gradient-to-r from-titleColor/90 to-titleColor/70 text-black border border-titleColor/50 shadow-md shadow-titleColor/20 hover:shadow-titleColor/30 hover:from-titleColor hover:to-titleColor/80'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Marketing Playbook Generation
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}