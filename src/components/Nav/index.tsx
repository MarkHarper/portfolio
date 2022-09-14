import { Link } from 'react-router-dom';

import './styles.css';

const Nav = () => (
  <header className='nav-main'>
    <Link to='/'>
      <div className='nav-name'>Mark Harper</div>
    </Link>
  </header>
);

export default Nav;
