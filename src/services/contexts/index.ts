import { createContext } from "react";

export const SizingContext = createContext<{
  height: number | null;
  width: number | null;
  isMobile: boolean | null;
}>({
  height: null,
  width: null,
  isMobile: null,
});
