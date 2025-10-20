import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type SizingState = {
  height: number | null;
  width: number | null;
};

type SizingContextValue = {
  size: SizingState;
  setSize: (size: SizingState) => void;
};

const SizingContext = createContext<SizingContextValue>({
  size: {
    height: null,
    width: null,
  },
  setSize: () => {}, // eslint-disable-line
});

type Props = {
  children: ReactNode;
};
export const SizingContextProvider: FC<Props> = ({ children }) => {
  const [size, setSize] = useState<SizingState>({
    width: window.innerWidth,
    height: window.innerHeight,
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
