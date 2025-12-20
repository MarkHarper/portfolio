import { useEffect, useState } from 'react';
import './styles.css';

type PaletteProps = {
  themeName: string;
  isActive?: boolean;
  onClick?: () => void;
};

const COLOR_NAMES = [
  'brand',
  'success',
  'warning',
  'danger',
  'neutral',
] as const;

const Palette = ({ themeName, isActive = false, onClick }: PaletteProps) => {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Create a temporary element with the theme class to extract its colors
    const tempDiv = document.createElement('div');
    tempDiv.className = themeName;
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.pointerEvents = 'none';
    document.body.appendChild(tempDiv);

    const computedStyle = getComputedStyle(tempDiv);
    const extractedColors: Record<string, string> = {};

    COLOR_NAMES.forEach((colorName) => {
      const cssVarName = `--wa-color-${colorName}-50`;
      const color = computedStyle.getPropertyValue(cssVarName).trim();
      if (color) {
        extractedColors[colorName] = color;
      }
    });

    setColors(extractedColors);
    document.body.removeChild(tempDiv);
  }, [themeName]);

  return (
    <wa-button
      variant='neutral'
      onclick={onClick}
      className={isActive ? 'palette-btn palette--active' : 'palette-btn'}
    >
      <div className='palette__grid'>
        {COLOR_NAMES.map((colorName) => {
          return (
            <div
              key={colorName}
              className='palette__swatch'
              style={{
                backgroundColor: colors[colorName] || 'transparent',
              }}
              title={`${colorName}-50`}
            />
          );
        })}
      </div>
      <div className='palette__label'>{themeName}</div>
    </wa-button>
  );
};

export default Palette;
