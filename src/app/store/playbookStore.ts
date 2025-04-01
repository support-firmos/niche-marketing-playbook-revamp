import { create } from 'zustand';

export interface Playbook {
  title: string;
  audience: string;
  pain: string;
  fear: string;
  goals: string;
  objection: string;
  value: string;
  decision: string;
  metrics: string;
  communication: string;
  content: string;
  lead: string;
}

type PlaybookStore = {
  step5GeneratedPlaybook: Playbook[] | null;
  setStep5GeneratedPlaybook: (playbook: Playbook[] | null) => void;
};

export const usePlaybookStore = create<PlaybookStore>((set) => ({
  step5GeneratedPlaybook: null,
  setStep5GeneratedPlaybook: (playbook) => set({ step5GeneratedPlaybook: playbook }),
}));

