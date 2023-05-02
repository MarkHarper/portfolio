import { UiComponentProps } from '~/types/react';
import './styles.css';

const Header = ({
  className = '',
  children,
}: UiComponentProps): JSX.Element => (
  <header className={className}>{children}</header>
);

export default Header;
