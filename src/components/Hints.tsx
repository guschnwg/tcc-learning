import React from "react";

import Button from './Button';
import Modal from './Modal';

interface HintsProps {
  hints: Hint[]
  hintsViewed: HintView[]
  show: boolean
  onHide: () => void
  onTipView: (index: number) => void
}

const Hints: React.FC<HintsProps> = ({ hints, hintsViewed, show, onHide, onTipView }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <ul>
        {hints.map((hint) => {
          const hintView = hintsViewed.find(h => h.id === hint.id);
          if (hintView) {
            return <li key={hint.id}>{hint.description} - Visto aos {hintView.timestamp}s</li>;
          }

          return (
            <li key={hint.id}>
              <Button onClick={() => onTipView(hint.id)}>Mostrar</Button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};

export default Hints;
