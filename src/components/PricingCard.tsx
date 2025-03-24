import React from 'react';

interface PricingCardProps {
  basicPricing: number;
  standardPricing: number;
  premiumPricing: number;
  arrBasic: number;
  arrStandard: number;
  arrPremium: number;
  convertedRevenue: number;
  netRoiBasic: number;
  netRoiStandard: number;
  netRoiPremium: number;
  setBasicPricing: (price: number) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  basicPricing,
  standardPricing,
  premiumPricing,
  arrBasic,
  arrStandard,
  arrPremium,
  convertedRevenue,
  netRoiBasic,
  netRoiStandard,
  netRoiPremium,
  setBasicPricing
}) => {
  // Function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const tierClasses = {
    basic: "bg-green-900 border-slate-700 text-slate-200",
    standard: "bg-blue-900 border-blue-800 text-blue-100",
    premium: "bg-purple-900 border-purple-800 text-purple-100"
  };

  const PricingTier = ({ 
    title, 
    price, 
    arr, 
    netRoi, 
    colorClass, 
    isEditable = false 
  }: { 
    title: string, 
    price: number, 
    arr: number, 
    netRoi: number, 
    colorClass: string, 
    isEditable?: boolean 
  }) => (
    <div className={`${colorClass} p-4 rounded-lg shadow-lg transform transition-all hover:scale-105`}>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span> Pricing </span>
          {isEditable ? (
            <input
              type="number"
              value={price}
              onChange={(e) => setBasicPricing(Number(e.target.value))}
              className="w-24 text-center text-black bg-white border-2 rounded-sm"
            />
          ) : (
            <span className="font-semibold">{formatCurrency(price)}</span>
          )}
        </div>
        <div className="flex justify-between">
          <span>Annual Recurring Revenue (ARR)</span>
          <span className="font-semibold">{formatCurrency(arr)}</span>
        </div>
        <div className="flex justify-between">
          <span>Net ROI</span>
          <span className="font-semibold">{formatCurrency(netRoi)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-4">
        <PricingTier 
          title="Basic Tier" 
          price={basicPricing} 
          arr={arrBasic} 
          netRoi={netRoiBasic} 
          colorClass={tierClasses.basic}
          isEditable
        />
        <PricingTier 
          title="Standard Tier" 
          price={standardPricing} 
          arr={arrStandard} 
          netRoi={netRoiStandard} 
          colorClass={tierClasses.standard}
        />
        <PricingTier 
          title="Premium Tier" 
          price={premiumPricing} 
          arr={arrPremium} 
          netRoi={netRoiPremium} 
          colorClass={tierClasses.premium}
        />
      </div>
      <div className="mt-4 bg-slate-950 p-4 rounded-lg">
        <div className="flex justify-between">
          <span>Average Annual Revenue Per Client</span>
          <span className="font-semibold">{formatCurrency(convertedRevenue)}</span>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;