import { createContext, FC, ReactNode, useState } from 'react';
import { VizState } from '../visualization';

export type VizRef = {
  current: VizState;
};

export type VizRefContext = {
  viz: VizState | null;
  setViz: (vizState: VizState) => void;
};

export const VizContext = createContext<VizRefContext>({
  viz: null,
  setViz: () => {} // eslint-disable-line
});

export type Props = {
  children: ReactNode;
};
export const VizContextProvider: FC<Props> = ({ children }) => {
  const [viz, setViz] = useState<VizState | null>(null);
  const contextValue: VizRefContext = {
    viz,
    setViz,
  };

  return <VizContext.Provider value={contextValue}>{children}</VizContext.Provider>;
};
