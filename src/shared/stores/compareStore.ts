import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ArtificialAnalysisModel } from "../types";
import { MAX_COMPARE_MODELS, STORAGE_KEYS } from "../constants";
import { modelId } from "../utils/modelId";

interface CompareState {
  compareIds: string[];
  toggleCompareModel: (model: ArtificialAnalysisModel) => void;
  removeCompareModel: (model: { id?: string; slug?: string }) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      compareIds: [],
      toggleCompareModel: (model) =>
        set((state) => {
          const key = modelId(model);
          if (!key) return state;
          const exists = state.compareIds.includes(key);
          if (exists) return { compareIds: state.compareIds.filter((id) => id !== key) };
          if (state.compareIds.length >= MAX_COMPARE_MODELS) return state;
          return { compareIds: [...state.compareIds, key] };
        }),
      removeCompareModel: (model) =>
        set((state) => {
          const key = modelId(model);
          if (!key) return state;
          return { compareIds: state.compareIds.filter((id) => id !== key) };
        }),
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: STORAGE_KEYS.compare,
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ compareIds: state.compareIds }),
    },
  ),
);
