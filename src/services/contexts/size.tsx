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
  setSize: () => {},
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
    let observer;
    window.addEventListener('load', () => {
      observer = new ResizeObserver(([entry]) => {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });
      observer.observe(document.documentElement);
    });

    return () => observer && observer.disconnect();
  }, []);

  return (
    <SizingContext.Provider value={contextValue}>
      {children}
    </SizingContext.Provider>
  );
};

export const useSize = () => useContext(SizingContext);
