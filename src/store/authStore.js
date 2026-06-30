import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      instituteUUID: null,

      setInstituteUUID: (uuid) =>
        set({
          instituteUUID: uuid,
        }),

      clearInstituteUUID: () =>
        set({
          instituteUUID: null,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;