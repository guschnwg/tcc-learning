import React from 'react';
import ReactModal from 'react-modal';

interface Props {
  show: boolean;
  onHide: () => void;
}

const Modal: React.FC<Props> = ({ children, show, onHide }) => {
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
    >
      {children}
    </ReactModal>
  );
};

export default Modal;
