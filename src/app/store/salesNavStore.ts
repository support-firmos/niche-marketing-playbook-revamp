import { create } from 'zustand';

type SalesNavStore = {
  step3GeneratedSalesNav: string | null;
  setStep3GeneratedSalesNav: (salesnav: string | null) => void;
};

export const useSalesNavStore = create<SalesNavStore>((set) => ({
  step3GeneratedSalesNav: null,
  setStep3GeneratedSalesNav: (salesnav) => set({ step3GeneratedSalesNav: salesnav }),
}));