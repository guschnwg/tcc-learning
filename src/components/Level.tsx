import React, { useRef, useState } from 'react';
import Button from './Button';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';
import { PlaceChooserModal } from './PlaceChooser';
import Hints from './Hints';

const Level: React.FC<LevelProps> = ({ current, hints, guessLimit, startTime, guesses, hintsViewed, onNext, onGuess, onHintViewed, onTimePassed }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [hintsModalOpened, setHintsModalOpened] = useState(false);
  const time = useRef(0); // Not ideal, but :(

  const canGuess = guessLimit === 0 || guesses.length < guessLimit;

  return (
    <div className="game-container full">
      <div className="game-header">
        <div>
          <Button onClick={() => setMapModalOpened((prev) => !prev)}>
            Palpitar {guesses.length}/{guessLimit === 0 ? "∞" : guessLimit}
          </Button>
          <Button onClick={() => setHintsModalOpened((prev) => !prev)}>
            Dicas {hintsViewed.length}/{hints.length}
          </Button>
        </div>

        <div>
          <Stopwatch
            key={current.id}
            start={startTime}
            onChange={total => time.current = total}
            onStep={onTimePassed}
          />
        </div>

        <div>
          <Button onClick={() => onNext()}>Pular</Button>
        </div>
      </div>

      <div className="game-body full-height">
        <StreetView
          markers={[]}
          guesses={guesses}
          coordinates={current}
        />
      </div>

      <PlaceChooserModal
        show={mapModalOpened}
        coordinates={current}
        canGuess={canGuess}
        guesses={guesses}
        onHide={() => setMapModalOpened(false)}
        onConfirm={(marker, data, distance) => onGuess(marker, data, time.current, distance)}
      />

      <Hints
        hints={hints}
        hintsViewed={hintsViewed}
        show={hintsModalOpened}
        onHide={() => setHintsModalOpened(false)}
        onHintView={(hint: HintEntity) => onHintViewed(hint, time.current)}
      />
    </div>
  );
};

export default Level;
