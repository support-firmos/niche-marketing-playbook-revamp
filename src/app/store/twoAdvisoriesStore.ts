import { create } from 'zustand';

type AdvisoriesStore = {
    industryAdvisory1: string | '';
    industryAdvisory2: string | '';
    setIndustryAdvisory1: (advisory: string | '') => void;
    setIndustryAdvisory2: (advisory: string | '') => void;
};

export const useAdvisoriesState = create<AdvisoriesStore>((set) => ({
    industryAdvisory1: '',
    industryAdvisory2: '',
    setIndustryAdvisory1: (advisory) => set({ industryAdvisory1: advisory }),
    setIndustryAdvisory2: (advisory) => set({ industryAdvisory2: advisory }),
}));