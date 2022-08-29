import { createContext } from "react";

export const SizingContext = createContext({
  height: null,
  width: null,
  isMobile: null,
});
