import type { UiComponentProps } from '~/types/react';
import './styles.css';

const Paragraph = ({
  className = '',
  children,
}: UiComponentProps): JSX.Element => <p className={className}>{children}</p>;

export default Paragraph;
