import './styles.css';

export enum Orientations {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

export type Orientation = `${Orientations}`;

type Props = {
  className?: string;
  orientation?: Orientation;
};

const Divider = ({
  className = '',
  orientation = Orientations.HORIZONTAL,
}: Props) => <hr className={`divider ${orientation} ${className}`} />;

export default Divider;
