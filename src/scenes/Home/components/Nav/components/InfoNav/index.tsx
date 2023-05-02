import Link from '~/components/Link';
import Heading from '~/components/Heading';
import Paragraph from '~/components/Paragraph';
import { BLURB, TAG_LINE } from '~/services/content';
import './styles.css';

const InfoNav = () => (
  <>
    <Heading>{TAG_LINE}</Heading>
    <Paragraph className='details'>
      {BLURB} To learn more about me, check out my{' '}
      <Link to='/resume.pdf' external>
        resume
      </Link>
      .
    </Paragraph>
  </>
);

export default InfoNav;
