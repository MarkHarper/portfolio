import '@awesome.me/webawesome/dist/components/button/button.js';

import MainLayout from '~/components/MainLayout';
import VizSettings from '~/pages/Settings/components/VizSettings';

const Settings = () => (
  <MainLayout>
    <h3>Settings</h3>
    <VizSettings />
  </MainLayout>
);

export default Settings;
