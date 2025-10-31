import { create } from 'zustand';

interface AppState {
  selectedClass: string | null;
  setSelectedClass: (className: string | null) => void;
  
  selectedSamples: string[];
  setSelectedSamples: (samples: string[]) => void;
  
  confidenceThreshold: number;
  setConfidenceThreshold: (threshold: number) => void;
  
  camOpacity: number;
  setCamOpacity: (opacity: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedClass: null,
  setSelectedClass: (className) => set({ selectedClass: className }),
  
  selectedSamples: [],
  setSelectedSamples: (samples) => set({ selectedSamples: samples }),
  
  confidenceThreshold: 0.5,
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
  
  camOpacity: 0.6,
  setCamOpacity: (opacity) => set({ camOpacity: opacity }),
}));
