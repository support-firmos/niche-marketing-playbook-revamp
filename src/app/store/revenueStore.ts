import { create } from 'zustand';

type RevenueStore = {
  revenue: number | null;
  setRevenue: (revenue: number | string | null) => void;
};

export const useRevenueStore = create<RevenueStore>((set) => ({
  revenue: null,
  setRevenue: (revenue) => set({
    revenue: revenue === null || revenue === '' 
      ? null 
      : typeof revenue === 'string' 
        ? Number(revenue) 
        : revenue
  }),
}));