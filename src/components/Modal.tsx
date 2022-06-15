import React from 'react';
import ReactModal from 'react-modal';

interface Props {
  className?: string
  portalClassName?: string
  show: boolean;
  onHide: () => void;
}

const Modal: React.FC<Props> = ({ className = "", portalClassName = "", children, show, onHide }) => {
  return (
    <ReactModal
      isOpen={show}
      onRequestClose={onHide}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      style={{
        overlay: {
          backgroundColor: undefined,
        },
        content: {
          inset: '150px',
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
