import React from "react";

import Button from './Button';
import Modal from './Modal';

interface HintsProps {
  hints: HintEntity[]
  hintsViewed: GameLevelHintEntity[]
  show: boolean
  onHide: () => void
  onHintView: (hint: HintEntity) => void
}

const Hints: React.FC<HintsProps> = ({ hints, hintsViewed, show, onHide, onHintView }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <ul>
        {hints.map((hint) => {
          const hintView = hintsViewed.find(h => h.hint_id === hint.id);
          if (hintView) {
            return <li key={hint.id}>{hint.description} - Visto aos {hintView.time_elapsed}s</li>;
          }

          return (
            <li key={hint.id}>
              <Button onClick={() => onHintView(hint)}>Mostrar</Button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};

export default Hints;
