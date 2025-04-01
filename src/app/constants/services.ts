interface ServiceItem {
    id: string;
    label: string;
  }
  
interface ServiceCategory {
    name: string;
    services: ServiceItem[];
  }

export const serviceCategories: ServiceCategory[] = [
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