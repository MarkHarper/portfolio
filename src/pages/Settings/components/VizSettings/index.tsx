import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import '@awesome.me/webawesome/dist/components/card/card.js';

import { NodeList } from './components/NodeList';
import { useViz } from '~/services/contexts/viz';
import DensitySlider from './components/DensitySlider';
import LineColorPicker from './components/LineColorPicker';
import EdgeDistanceSlider from './components/EdgeDistanceSlider';
import MaxVelocitySlider from './components/MaxVelocitySlider';
import SpringStrengthSlider from './components/SpringStrengthSlider';

import './styles.css';

const VizSettings = () => {
  const settings = useViz();

  if (!settings) return null;

  return (
    <wa-tab-group>
      <wa-tab panel='general'>General</wa-tab>
      <wa-tab panel='nodeTypes'>Node Types</wa-tab>

      <wa-tab-panel name='general'>
        <wa-card>
          <div className='wa-grid wa-gap-xl'>
            <div className='wa-span-grid'>
              <LineColorPicker />
            </div>
            <DensitySlider />
            <EdgeDistanceSlider />
            <MaxVelocitySlider />
            <SpringStrengthSlider />
          </div>
        </wa-card>
      </wa-tab-panel>

      <wa-tab-panel name='nodeTypes'>
        <NodeList />
      </wa-tab-panel>
    </wa-tab-group>
  );
};

export default VizSettings;
