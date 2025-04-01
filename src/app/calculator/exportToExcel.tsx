import React, { useCallback } from 'react';
import * as XLSX from 'xlsx';
import Button from '@/components/Button';

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

interface ExportToExcelProps {
    services: ServiceItem[];
    tierData: TierData;
    serviceNames: Record<string, string>;
    pricingData: {
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
    };
}

export const ExportToExcel: React.FC<ExportToExcelProps> = ({
    services,
    tierData,
    serviceNames,
    pricingData
}) => {
    const exportToExcel = useCallback(() => {
        // Prepare service tier data
        const serviceTierData = services.map(service => ({
            'Service Category': serviceNames[service.id] || service.name,
            'Top Tier (Premium)': getTierValue(tierData[service.id]?.top),
            'Middle Tier (Standard)': getTierValue(tierData[service.id]?.middle),
            'Bottom Tier (Basic)': getTierValue(tierData[service.id]?.free)
        }));

        // Add pricing data to the same sheet
        const pricingDataRows = [
            {},
            {
                'Service Category': 'Pricing Details',
                'Top Tier (Premium)': '',
                'Middle Tier (Standard)': '',
                'Bottom Tier (Basic)': ''
            },
            {
                'Service Category': 'Annual Recurring Revenue (ARR)',
                'Top Tier (Premium)': `$${pricingData.arrPremium}`,
                'Middle Tier (Standard)': `$${pricingData.arrStandard}`,
                'Bottom Tier (Basic)': `$${pricingData.arrBasic}`
            },
            {
                'Service Category': 'Current Avg ARR Per Client',
                'Top Tier (Premium)': `$${pricingData.convertedRevenue}`,
                'Middle Tier (Standard)': `$${pricingData.convertedRevenue}`,
                'Bottom Tier (Basic)': `$${pricingData.convertedRevenue}`
            },
            {
                'Service Category': 'Net Annual Gain',
                'Top Tier (Premium)': `$${pricingData.netRoiPremium}`,
                'Middle Tier (Standard)': `$${pricingData.netRoiStandard}`,
                'Bottom Tier (Basic)': `$${pricingData.netRoiBasic}`
            }
        ];

        // Combine all data
        const allData = [...serviceTierData, ...pricingDataRows];

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(allData);

        // Add styling (header colors)
        if (ws['!cols']) {
            ws['!cols'] = [];
        }
        
        // Set column widths
        ws['!cols'] = [
            { wch: 40 }, // Service Category column width
            { wch: 20 }, // Premium column width
            { wch: 20 }, // Standard column width
            { wch: 20 }  // Basic column width
        ];

        // Set column widths for better formatting
        if (!ws['!cols']) ws['!cols'] = [];
        ws['!cols'] = [
            { wch: 40 }, // Service Category
            { wch: 20 }, // Premium
            { wch: 20 }, // Standard
            { wch: 20 }  // Basic
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Service Tiers & Pricing');

        // Export the file
        XLSX.writeFile(wb, 'Service_Tiers_Pricing.xlsx');
    }, [services, tierData, serviceNames, pricingData]);

    // Helper function to convert tier values to checkmarks
    const getTierValue = (value: string | boolean) => {
        if (typeof value === 'boolean') {
            return value ? '✓' : '';
        }
        return value || '';
    };

    return (
        <Button 
            variant="outline" 
            onClick={exportToExcel}
            className=""
        >
            Export to Excel
        </Button>
    );
};