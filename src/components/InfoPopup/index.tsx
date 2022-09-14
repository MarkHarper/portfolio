import { FC, ReactNode, useState } from 'react';
import 'styles.css';

interface Props {
  initialIsOpen?: boolean;
  children: ReactNode;
  Content?: FC;
}

const InfoPopup: FC<Props> = ({ initialIsOpen, children, Content }) => {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const close = () => setIsOpen(false);

  return (
    <div className='container'>
      <span className='tooltip' style={isOpen ? { display: 'block' } : {}}>
        <button className='close' onClick={close}>
          X
        </button>
        {Content && <Content />}
      </span>
      {children}
    </div>
  );
};

export default InfoPopup;
