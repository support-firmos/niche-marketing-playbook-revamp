import { create } from 'zustand';

type EnhancedStore = {
  step2EnhancedResearch: string | null;
  setStep2EnhancedResearch: (enhanced: string | null) => void;
};

export const useEnhancedStore = create<EnhancedStore>((set) => ({
  step2EnhancedResearch: null,
  setStep2EnhancedResearch: (enhanced) => set({ step2EnhancedResearch: enhanced }),
}));