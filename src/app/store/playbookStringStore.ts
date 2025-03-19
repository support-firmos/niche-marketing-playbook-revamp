import { create } from 'zustand';

type PlaybookStringStore = {
  step5StringPlaybook: string | null;
  setStep5StringPlaybook: (playbook: string | null) => void;
};

export const usePlaybookStringStore = create<PlaybookStringStore>((set) => ({
    step5StringPlaybook: null,
  setStep5StringPlaybook: (playbook) => set({ step5StringPlaybook: playbook }),
}));



