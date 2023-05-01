import { faMoon, faSun } from '@fortawesome/pro-solid-svg-icons';

import { Size, Variants } from '~/types/variant';
import { useThemeName } from '~/services/contexts/theme';
import { toggleTheme } from '~/services/theme';
import { ThemeNames } from '~/services/theme/config';
import IconButton from '~/components/IconButton';

type Props = {
  className?: string;
  iconSize: Size;
};

const ThemeToggle = ({ className = '', iconSize }: Props): JSX.Element => {
  const { themeName, setThemeName } = useThemeName();
  const isLightTheme = themeName === ThemeNames.LIGHT;
  const onClick = () => {
    const theme = toggleTheme();
    setThemeName(theme);
  };

  return (
    <IconButton
      className={className}
      variant={Variants.GHOST}
      icon={isLightTheme ? faSun : faMoon}
      title='Toggle Theme'
      iconSize={iconSize}
      onClick={onClick}
    />
  );
};

export default ThemeToggle;
