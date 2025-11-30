import MainLayout from '~/components/MainLayout';
import {
  Intro,
  Factivate,
  Exaptive,
  Privy,
  Closing,
} from '~/services/content/resume-description';

const Work = () => (
  <MainLayout>
    <h3>Work</h3>
    <p>
      <Intro />
    </p>
    <h4>Factivate</h4>
    <p>
      <Factivate />
    </p>
    <h4>Exaptive</h4>
    <p>
      <Exaptive />
    </p>
    <h4>Privy</h4>
    <p>
      <Privy />
    </p>
    <h4>Title</h4>
    <p>
      <Closing />
    </p>
  </MainLayout>
);

export default Work;
