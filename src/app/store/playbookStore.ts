import { create } from 'zustand';

type PlaybookStore = {
  step5GeneratedPlaybook: string | null;
  setStep5GeneratedPlaybook: (playbook: string | null) => void;
};

export const usePlaybookStore = create<PlaybookStore>((set) => ({
  step5GeneratedPlaybook: null,
  setStep5GeneratedPlaybook: (playbook) => set({ step5GeneratedPlaybook: playbook }),
}));