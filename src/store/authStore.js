import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      instituteUUID: null,

      setInstituteUUID: (uuid) =>
        set(() => {
          console.log("Active Institute:", uuid);
          return { instituteUUID: uuid };
        }),

      clearInstituteUUID: () =>
        set(() => {
          console.log("Active Institute: cleared");
          return { instituteUUID: null };
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;