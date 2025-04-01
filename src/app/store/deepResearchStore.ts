import { create } from 'zustand';


type DeepSegmentResearchStore = {
  step4DeepSegmentResearch: string | null;
  setStep4DeepSegmentResearch: (deepResearch: string | null) => void;
};

export const useDeepSegmentResearchStore = create<DeepSegmentResearchStore>((set) => ({
  step4DeepSegmentResearch: null,
  setStep4DeepSegmentResearch: (deepResearch) => set({ step4DeepSegmentResearch: deepResearch }),
}));