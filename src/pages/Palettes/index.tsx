import MainLayout from '~/components/MainLayout';
import PaletteSelector from './components/PaletteSelector';

const Palettes = () => (
  <MainLayout>
    <div className='wa-stack wa-gap-sm'>
      <h3>Palettes</h3>
      <PaletteSelector />
    </div>
  </MainLayout>
);

export default Palettes;
