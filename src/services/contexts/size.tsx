import isMobile from 'is-mobile';
import { createContext, FC, ReactNode, useEffect, useState } from 'react';

export type SizingState = {
  height: number | null;
  width: number | null;
  isMobile: boolean | null;
};

export type SizingContextValue = {
  size: SizingState;
  setSize: (size: SizingState) => void;
};

export const SizingContext = createContext<SizingContextValue>({
  size: {
    height: null,
    width: null,
    isMobile: isMobile(),
  },
  setSize: () => {}, // eslint-disable-line
});

export type Props = {
  children: ReactNode;
};
export const SizingContextProvider: FC<Props> = ({ children }) => {
  const [size, setSize] = useState<SizingState>({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: isMobile(),
  });
  const contextValue: SizingContextValue = {
    size,
    setSize,
  };

  useEffect(() => {
    window.addEventListener('resize', () => {
      setSize({
        isMobile: isMobile(),
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });
  }, []);

  return <SizingContext.Provider value={contextValue}>{children}</SizingContext.Provider>;
};
