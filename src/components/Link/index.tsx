import { Link as RouterLink } from 'react-router-dom';
import { UiComponentProps } from '~/types/react';
import './styles.css';

type LinkProps = {
  external?: boolean;
  to: string;
} & UiComponentProps;

const Link = ({
  to,
  external,
  className = '',
  children,
}: LinkProps): JSX.Element => {
  const combinedClass = `link ${className}`;
  if (external) {
    return (
      <a href={to} target='_blank' rel='noreferrer' className={combinedClass}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={to} className={combinedClass}>
      {children}
    </RouterLink>
  );
};

export default Link;
