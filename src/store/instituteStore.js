import { create } from "zustand";
import { persist } from "zustand/middleware";

// Demo data — Mothers Public School branches across locations.
// Swap this out for a real API call later; shape stays the same.
export const INSTITUTES = [
  { id: "unit1", name: "Mothers Public School — Unit-1" },
  { id: "ctc", name: "Mothers Public School — CTC" },
  { id: "firestation", name: "Mothers Public School — Firestation" },
  { id: "puri", name: "Mothers Public School — Puri" },
  { id: "rkl", name: "Mothers Public School — RKL" },
];

const useInstituteStore = create(
  persist(
    (set) => ({
      // null / "__all__" = viewing global data across every school
      activeInstituteId: "__all__",
      setActiveInstitute: (id) => set({ activeInstituteId: id }),
    }),
    {
      name: "institute-storage",
    },
  ),
);

export default useInstituteStore;
