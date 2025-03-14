'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRevenueStore } from './store/revenueStore';
import { useServicesStore } from './store/servicesStore'
import Sidebar from "@/components/Sidebar";

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
  const { selectedServices, setSelectedServices } = useServicesStore();
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

  // Initialize local state from store when component mounts
  useEffect(() => {
    // Convert selectedServices array to a Record<string, boolean> for the local state
    const servicesMap: Record<string, boolean> = {};
    selectedServices.forEach(service => {
      servicesMap[service.id] = true;
    });
    setLocalSelectedServices(servicesMap);
  }, [selectedServices]);

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
              <header className="flex justify-center items-center mb-12 mt-10 md:mt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-titleColor">
            Customer Niche Marketing Playbook
          </h1>
        </header>
      <div className="relative flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  
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