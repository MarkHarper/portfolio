import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { VizState } from '../visualization';

export type VizRef = {
  current: VizState;
};

export type VizRefContext = {
  viz: VizState | null;
  setViz: (vizState: VizState | null) => void;
};

const VizContext = createContext<VizRefContext>({
  viz: null,
  setViz: () => {}, // eslint-disable-line
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

  return (
    <VizContext.Provider value={contextValue}>{children}</VizContext.Provider>
  );
};

export const useViz = () => {
  const { viz, setViz } = useContext(VizContext);
  const toggle = () => {
    if (!viz) return;
    if (viz.runner.running) {
      viz.runner.stop();
      setViz({
        ...viz,
        isRunning: false,
      });
      return;
    }

    viz.runner.start();
    setViz({
      ...viz,
      isRunning: true,
    });
  };
  const restart = () => {
    if (!viz) return;

    viz.field.resetParticles();
    viz.runner.draw();
  };

  return {
    viz,
    setViz,
    restart,
    toggle,
  };
};
