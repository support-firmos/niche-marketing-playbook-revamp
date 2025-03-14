import { create } from 'zustand';

interface Segment {
  name: string;
  content: string;
}

type SalesNavSegmentsStore = {
  step3Segments: Segment[] | null;
  setStep3Segments: (segments: Segment[] | null) => void;
};

export const useSalesNavSegmentsStore = create<SalesNavSegmentsStore>((set) => ({
  step3Segments: null,
  setStep3Segments: (segments) => set({ step3Segments: segments }),
}));