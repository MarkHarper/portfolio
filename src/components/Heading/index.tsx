import { HTMLAttributes, forwardRef } from 'react';
import { UiComponentProps } from '~/types/react';
import { Size, Sizes, Variants } from '../../types/variant';
import './styles.css';

type HeadingProps = {
  variant?: Variants.PRIMARY | Variants.ACCENT;
  size?: Omit<Size, Sizes.DBL_XL | Sizes.DBL_XS>;
} & UiComponentProps &
  Omit<HTMLAttributes<HTMLDivElement>, 'size'>;

const Heading = forwardRef<HTMLDivElement, HeadingProps>(function Heading(
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
      className={`heading ${variant} ${size} ${className}`}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

export default Heading;
