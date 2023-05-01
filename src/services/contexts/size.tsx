import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const BASE_FONT_SIZE = 16;
const BREAKPOINT_WIDTH_REM_1 = 29;
const BREAKPOINT_WIDTH_REM_2 = 26;

export const BREAKPOINT_WIDTH_1 = BASE_FONT_SIZE * BREAKPOINT_WIDTH_REM_1;
export const BREAKPOINT_WIDTH_2 = BASE_FONT_SIZE * BREAKPOINT_WIDTH_REM_2;

export type SizingState = {
  height: number | null;
  width: number | null;
  isBelowBreakpoint1: boolean | null;
  isBelowBreakpoint2: boolean | null;
};

export type SizingContextValue = {
  size: SizingState;
  setSize: (size: SizingState) => void;
};

const SizingContext = createContext<SizingContextValue>({
  size: {
    height: null,
    width: null,
    isBelowBreakpoint1: null,
    isBelowBreakpoint2: null,
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
    isBelowBreakpoint1: window.innerWidth < BREAKPOINT_WIDTH_1,
    isBelowBreakpoint2: window.innerWidth < BREAKPOINT_WIDTH_2,
  });
  const contextValue: SizingContextValue = {
    size,
    setSize,
  };

  useEffect(() => {
    window.addEventListener('resize', () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isBelowBreakpoint1: window.innerWidth < BREAKPOINT_WIDTH_1,
        isBelowBreakpoint2: window.innerWidth < BREAKPOINT_WIDTH_2,
      });
    });
  }, []);

  return (
    <SizingContext.Provider value={contextValue}>
      {children}
    </SizingContext.Provider>
  );
};

export const useSize = () => useContext(SizingContext);
