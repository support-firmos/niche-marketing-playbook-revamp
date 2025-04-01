import { create } from 'zustand';

interface Service {
    id: string;
    label: string;
}

interface ServicesState {
    selectedServices: Service[];
    setSelectedServices: (services: Service[]) => void;
}

export const useServicesStore = create<ServicesState>((set) => ({
  selectedServices: [],
  setSelectedServices: (services) => set({ selectedServices: services }),
}));