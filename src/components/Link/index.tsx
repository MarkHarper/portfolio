import { UiComponentProps } from '~/types/react';
import './styles.css';

type LinkProps = {
  to: string;
} & UiComponentProps;

const Link = ({ to, className = '', children }: LinkProps) => (
  <a href={to} target='_blank' rel='noreferrer' className={`link ${className}`}>
    {children}
  </a>
);

export default Link;
