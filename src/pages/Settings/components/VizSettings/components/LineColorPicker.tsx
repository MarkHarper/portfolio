import '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import { useCallback, useEffect, useState } from 'react';
import { useViz, useVizDispatch } from '~/services/contexts/viz';
import { getTokensFromCss } from '~/services/theme/html';

const LineColorPicker = () => {
  const { lineColor, lineColorVar } = useViz();
  const dispatch = useVizDispatch();
  const [tokens, setTokens] = useState({});

  useEffect(() => {
    const cssTokens = getTokensFromCss();
    if (cssTokens) {
      setTokens(cssTokens);
    }
  }, []);

  const onChange = useCallback(
    (e) => {
      const newColor = e.target.value;

      // Find the CSS variable that matches the new color
      // or keep the current lineColorVar if we're just updating the color
      const matchingVar = Object.entries(tokens).find(
        ([_, value]) => value === newColor
      )?.[0] || lineColorVar;

      dispatch({
        type: 'lineColor',
        lineColor: newColor,
        lineColorVar: matchingVar,
      });
    },
    [dispatch, tokens, lineColorVar],
  );

  return (
    <wa-color-picker
      label='Line Color'
      format='hex'
      size='small'
      value={lineColor}
      onchange={onChange}
    ></wa-color-picker>
  );
};

export default LineColorPicker;
