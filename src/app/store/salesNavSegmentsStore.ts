import { create } from 'zustand';
import { DeepResearchSegment } from './deepResearchStore2';

export interface Segment {
  name: string;
  justification: string;
  challenges: string;
  jobtitles: string;
  industries: string;
  headcount: string;
  companytype: string;
  keywords: string;
  boolean: string;
  intentdata: string;
  deepResearch?: DeepResearchSegment;
}

type SalesNavSegmentsStore = {
  step3Segments: Segment[] | null;
  setStep3Segments: (segments: Segment[] | null) => void;
  updateSegmentDeepResearch: (segmentName: string, deepResearch: DeepResearchSegment) => void;
  nicheConsideration: string | null;
  setNicheConsideration: (niche: string | null) => void;
};

export const useSalesNavSegmentsStore = create<SalesNavSegmentsStore>((set) => ({
  step3Segments: null,
  nicheConsideration: null,
  setNicheConsideration: (niche) => set({ nicheConsideration: niche }),
  setStep3Segments: (segments) => set({ step3Segments: segments }),
  updateSegmentDeepResearch: (segmentName, deepResearch) => 
    set((state) => {
      if (!state.step3Segments) return state;
      
      const updatedSegments = state.step3Segments.map(segment => 
        segment.name === segmentName 
          ? { ...segment, deepResearch }
          : segment
      );
      
      return { step3Segments: updatedSegments };
    }),
}));