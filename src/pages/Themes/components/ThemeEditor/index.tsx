import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import { useTheme } from '~/services/contexts/theme';

const ThemeEditor = () => {
  const { tokens: themeTokens } = useTheme();

  return (
    <>
      <wa-tab-group>
        <wa-tab panel='general'>General</wa-tab>
        <wa-tab panel='colors'>Colors</wa-tab>
        <wa-tab panel='fonts'>Fonts</wa-tab>

        <wa-tab-panel name='general'>
          {/* <wa-slider
            label='Space Scale'
            name='spaceScale'
            value={themeTokens.general['--wa-space-scale']}
            min={0.5}
            max={10}
            step={0.1}
          ></wa-slider>
          <wa-slider
            label='Border Radius Scale'
            name='borderRadiusScale'
            value={themeTokens.general['--wa-border-radius-scale']}
            min={0.5}
            max={10}
            step={0.1}
          ></wa-slider>
          <wa-slider
            label='Border Width Scale'
            name='borderWidthScale'
            value={themeTokens.general['--wa-border-width-scale']}
            min={0.5}
            max={10}
            step={0.1}
          ></wa-slider> */}
        </wa-tab-panel>
        <wa-tab-panel name='colors'>This is the colors tab panel.</wa-tab-panel>
        <wa-tab-panel name='fonts'>This is the fonts tab panel.</wa-tab-panel>
      </wa-tab-group>
    </>
  );
};

export default ThemeEditor;
