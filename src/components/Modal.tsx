import React from 'react';
import ReactModal from 'react-modal';

interface Props {
  container?: HTMLElement | null
  className?: string
  portalClassName?: string
  show: boolean;
  onHide: () => void;
}

const Modal: React.FC<Props> = ({ container, className = "", portalClassName = "", children, show, onHide }) => {
  return (
    <ReactModal
      isOpen={show}
      onRequestClose={onHide}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      parentSelector={() => container || document.body}
      style={{
        overlay: {
          backgroundColor: undefined,
        },
        content: {
          inset: '80px',
          border: '1px solid #1d246e',
          background: '#323dbb',
          borderRadius: '12px',
          color: 'white',
          padding: '10px',
        },
      }}
      className={className}
      portalClassName={portalClassName}
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
