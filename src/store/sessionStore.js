import { create } from "zustand";
import { persist } from "zustand/middleware";

const currentYear = new Date().getFullYear();
const defaultSession = `${currentYear}-${String(currentYear + 1).slice(-2)}`;

const useSessionStore = create(
  persist(
    (set) => ({
      sessionYear: defaultSession,

      setSessionYear: (year) => {
        console.log("Active Session:", year);

        set({
          sessionYear: year,
        });
      },

      clearSessionYear: () =>
        set({
          sessionYear: defaultSession,
        }),
    }),
    {
      name: "session-storage",
    }
  )
);

export default useSessionStore;