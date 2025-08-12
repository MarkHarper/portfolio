import { HTMLAttributes, forwardRef } from 'react';
import { UiComponentProps } from '~/types/react';
import { Size, Sizes, Variants } from '../../types/variant';
import './styles.css';

type TextProps = {
  variant?: Variants.PRIMARY | Variants.ACCENT;
  size?: Omit<Size, Sizes.DBL_XL | Sizes.DBL_XS>;
} & UiComponentProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'size'>;

const Text = forwardRef<HTMLDivElement, TextProps>(function Heading(
  {
    variant = Variants.PRIMARY,
    size = Sizes.MD,
    className = '',
    children,
    ...props
  },
  ref,
) {
  return (
    <div
      className={`text ${variant} ${size} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

export default Text;
