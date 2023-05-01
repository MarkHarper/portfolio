import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HTMLProps } from 'react';
import { Size, Sizes, Variant, Variants } from '../../types/variant';
import Button from '../Button';
import './styles.css';

type ButtonProps = {
  variant: Omit<Variant, Variants.SECONDARY>;
  icon: IconProp;
  iconSize?: Size;
  rounded?: boolean;
  className?: string;
  iconClassName?: string;
} & HTMLProps<HTMLButtonElement>;

const IconButton = ({
  variant,
  rounded,
  className = '',
  iconClassName = '',
  icon,
  iconSize = Sizes.MD,
  ...props
}: ButtonProps): JSX.Element => (
  <Button
    variant={variant}
    className={`icon-button-${iconSize} ${className}`}
    rounded={rounded}
    {...props}
  >
    <FontAwesomeIcon
      icon={icon}
      className={`icon-${iconSize} ${iconClassName}`}
    />
  </Button>
);

export default IconButton;
