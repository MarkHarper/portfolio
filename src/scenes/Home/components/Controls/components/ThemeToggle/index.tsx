import { Size } from '~/types/variant';
import { useThemeName } from '~/services/contexts/theme';
import { toggleTheme } from '~/services/theme';
import { ThemeNames } from '~/services/theme/config';

type Props = {
  className?: string;
  iconSize: Size;
};

const ThemeToggle = ({ className = '', iconSize }: Props) => {
  const { themeName, setThemeName } = useThemeName();
  const isLightTheme = themeName === ThemeNames.LIGHT;
  const onClick = () => {
    const theme = toggleTheme();
    setThemeName(theme);
  };

  return (
    <wa-icon-button
      class={className}
      family='fontawesome'
      name={isLightTheme ? 'sun' : 'moon'}
      iconSize={iconSize}
      onClick={onClick}
    ></wa-icon-button>
  );
};

export default ThemeToggle;
