import { create } from 'zustand';

type RevenueStore = {
  revenue: string;
  setRevenue: (revenue: string | null) => void;
};

export const useRevenueStore = create<RevenueStore>((set) => ({
  revenue: '',
  setRevenue: (revenue) => set({revenue: revenue ?? '' }),
}));