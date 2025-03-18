import { create } from 'zustand';

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
}

type SalesNavSegmentsStore = {
  step3Segments: Segment[] | null;
  setStep3Segments: (segments: Segment[] | null) => void;
};

export const useSalesNavSegmentsStore = create<SalesNavSegmentsStore>((set) => ({
  step3Segments: null,
  setStep3Segments: (segments) => set({ step3Segments: segments }),
}));