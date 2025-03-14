import { create } from 'zustand';

interface SegmentResearch {
  displayContent: string | null;
  originalContent: Record<string, unknown>;
}

type DeepSegmentResearchStore = {
  step4DeepSegmentResearch: SegmentResearch | null;
  setStep4DeepSegmentResearch: (deepResearch: SegmentResearch | null) => void;
};

export const useDeepSegmentResearchStore = create<DeepSegmentResearchStore>((set) => ({
  step4DeepSegmentResearch: null,
  setStep4DeepSegmentResearch: (deepResearch) => set({ step4DeepSegmentResearch: deepResearch }),
}));