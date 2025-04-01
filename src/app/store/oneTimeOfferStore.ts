import { create } from 'zustand';

type OneTimeOfferStore = {
  generatedResult: string | null;
  setGeneratedResult: (offer: string | null) => void;
};

export const useOneTimeOfferStore = create<OneTimeOfferStore>((set) => ({
  generatedResult: null,
  setGeneratedResult: (offer) => set({ generatedResult: offer }),
}));