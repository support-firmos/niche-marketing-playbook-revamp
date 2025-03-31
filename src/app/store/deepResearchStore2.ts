import { create } from 'zustand';

export interface DeepResearchSegment {
  name: string;
  fears: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  pains: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  objections: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  goals: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  values: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  decisionMaking: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  influences: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
  communicationPreferences: Array<{
    title: string;
    explanation: string;
    advisoryHelp: string;
  }>;
}

type DeepResearchStore = {
  deepResearchSegments: DeepResearchSegment[] | null;
  setDeepResearchSegments: (segments: DeepResearchSegment[] | null) => void;
};

export const useDeepResearchStore = create<DeepResearchStore>((set) => ({
  deepResearchSegments: null,
  setDeepResearchSegments: (segments) => set({ deepResearchSegments: segments }),
}));