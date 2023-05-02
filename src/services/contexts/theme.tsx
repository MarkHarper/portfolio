import { createContext, useContext, useState } from 'react';
import { Children } from '~/types/react';
import { noop } from '~/types/effect';
import type { ThemeName } from '../theme/config';
import { getThemeName } from '../theme';

type ThemeNameContext = {
  themeName: ThemeName;
  setThemeName: (a: ThemeName) => void;
};

type ThemeNameContextProviderProps = {
  children: Children;
};

export const themeNameContext = createContext<ThemeNameContext>({
  themeName: getThemeName(),
  setThemeName: noop,
});
const { Provider } = themeNameContext;

export const ThemeNameContextProvider = ({
  children,
}: ThemeNameContextProviderProps) => {
  const { themeName: defaultThemeName } = useContext(themeNameContext);
  const [themeName, setThemeName] = useState<ThemeName>(defaultThemeName);
  const contextValue = {
    themeName,
    setThemeName,
  };

  return <Provider value={contextValue}>{children}</Provider>;
};

export const useThemeName = () => {
  return useContext(themeNameContext);
};
