import { create } from 'zustand';

type SegmentsStore = {
  step1GeneratedResearch: string | null;
  setStep1GeneratedResearch: (segments: string | null) => void;
};

export const useSegmentsStore = create<SegmentsStore>((set) => ({
  step1GeneratedResearch: null,
  setStep1GeneratedResearch: (segments) => set({ step1GeneratedResearch: segments }),
}));