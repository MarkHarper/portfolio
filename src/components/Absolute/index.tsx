import { UiComponentProps } from '~/types/react';
import './styles.css';

export type Coord = 'top' | 'left' | 'bottom' | 'right';
export type CoordDef = string | boolean | number;
export type Position = Partial<Record<Coord, CoordDef>>;

const VALID_COORD_DEF_TYPES = ['string', 'number'];
const COORDINATES: Coord[] = ['top', 'left', 'bottom', 'right'];

type AbsoluteProps = {
  El: keyof JSX.IntrinsicElements;
} & Position &
  UiComponentProps;

const coordIsDefined = (coord?: CoordDef) => coord !== undefined;

const getCoord = (coordDef: CoordDef) => {
  if (VALID_COORD_DEF_TYPES.includes(typeof coordDef)) return coordDef;
  if (coordDef) return '0';
  return 'unset';
};

const getPositionStyled = (
  position: Position,
): Partial<Record<Coord, string>> =>
  COORDINATES.filter((coord) => coordIsDefined(position[coord])).reduce(
    (map, coord) => ({
      ...map,
      [coord]: getCoord(position[coord] as boolean | number),
    }),
    {},
  );

const Absolute = ({
  El,
  className = '',
  children,
  ...position
}: AbsoluteProps): JSX.Element => {
  return (
    <El className={`absolute ${className}`} style={getPositionStyled(position)}>
      {children}
    </El>
  );
};

export default Absolute;
