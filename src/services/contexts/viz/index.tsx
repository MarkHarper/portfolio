import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { nanoid } from 'nanoid';

import { Children } from '~/types/react';
import { getTokens } from '../../theme/html';
import {
  LARGE_MASS,
  LARGE_RADIUS,
  SMALL_MASS,
  SMALL_RADIUS,
} from '../../visualization/field/constants';
import { vizReducer } from './reducer';
import { ReverseMap } from '~/utils/ReverseMap';

type VizContext = {
  density: number;
  lineColor: string;
  edgeDistance: number;
  maxVelocity: number;
  springStrength: number;
  nodes: any[];
  isRunning: true;
};

type VizContextProviderProps = {
  children: Children;
};

const DEFAULT_MIN_DISTANCE = 100;
export const DEFAULT_MIN_DISTANCE_SQUARED =
  DEFAULT_MIN_DISTANCE * DEFAULT_MIN_DISTANCE;

const DEFAULT_VIZ_SETTINGS = {
  density: 0.00035,
  edgeDistance: DEFAULT_MIN_DISTANCE_SQUARED,
  maxVelocity: 10,
  springStrength: 0.000002,
  isRunning: true,
};

const DEFAULT_LINE_COLOR_VAR = '--color-item-C';

const VizContext = createContext<VizContext | null>(null);
const VizDispatchContext = createContext(null);

export const VizContextProvider = ({ children }: VizContextProviderProps) => {
  const [vizSettings, dispatch] = useReducer(vizReducer, DEFAULT_VIZ_SETTINGS);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const tokens = getTokens();

    if (tokens) {
      const nodeOptionA = {
        id: nanoid(),
        color: tokens['--color-item-A'],
        mass: LARGE_MASS,
        radius: LARGE_RADIUS,
        speed: 0.25,
      };
      const nodeOptionB = {
        id: nanoid(),
        color: tokens['--color-item-B'],
        mass: SMALL_MASS,
        radius: SMALL_RADIUS,
        speed: 0.5,
      };
      const nodeOptionD = {
        id: nanoid(),
        color: tokens['--color-item-D'],
        mass: SMALL_MASS,
        radius: SMALL_RADIUS,
        speed: 1,
      };

      dispatch({
        type: 'setSettings',
        settings: {
          ...DEFAULT_VIZ_SETTINGS,
          lineColor: tokens[DEFAULT_LINE_COLOR_VAR],
          nodes: new ReverseMap([
            [nodeOptionA.id, nodeOptionA],
            [nodeOptionB.id, nodeOptionB],
            [nodeOptionD.id, nodeOptionD],
          ]),
        },
      });
    }
  }, []);

  const value = useMemo(
    () => ({
      ...vizSettings,
      ref,
    }),
    [vizSettings],
  );

  return (
    <VizContext value={value}>
      <VizDispatchContext value={dispatch}>{children}</VizDispatchContext>
    </VizContext>
  );
};

export const useViz = () => {
  return useContext(VizContext);
};

export const useVizDispatch = () => {
  return useContext(VizDispatchContext);
};
