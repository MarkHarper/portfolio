import { HTMLAttributes } from 'react';
import { UiComponentProps } from '~/types/react';
import { Variant, Variants } from '../../types/variant';
import './styles.css';

type ButtonProps = {
  variant: Omit<Variant, Variants.SECONDARY>;
  rounded?: boolean;
} & UiComponentProps &
  HTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = Variants.PRIMARY,
  rounded,
  className = '',
  children,
  'aria-label': ariaLabel,
  ...props
}: ButtonProps): JSX.Element => (
  <button
    className={`${variant} ${rounded ? 'rounded' : ''} ${className}`}
    aria-label={ariaLabel}
    {...props}
  >
    {children}
  </button>
);

export default Button;
