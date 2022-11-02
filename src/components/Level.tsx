import React, { useRef, useState } from 'react';
import Button from './Button';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';
import { PlaceChooserModal } from './PlaceChooser';
import Hints from './Hints';
import Carousel from './Carousel';

const Level: React.FC<LevelProps> = ({ current, hints, guessLimit, startTime, guesses, hintsViewed, onGuess, onHintViewed, onTimePassed, onNext }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [hintsModalOpened, setHintsModalOpened] = useState(false);
  const time = useRef(0); // Not ideal, but :(

  const canGuess = guessLimit === 0 || guesses.length < guessLimit;

  return (
    <>
      <div className="game-header">
        <div>
          <Button onClick={() => setMapModalOpened((prev) => !prev)}>
            Palpitar {guesses.length}/{guessLimit === 0 ? "∞" : guessLimit}
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
          <Button onClick={() => setHintsModalOpened((prev) => !prev)}>
            Dicas {hintsViewed.length}/{hints.length}
          </Button>
        </div>
      </div>

      <div className="game-body full-height">
        <StreetView
          markers={[]}
          guesses={guesses}
          coordinates={current}
        />
        <Carousel
          guesses={guesses}
          coordinates={current}
        />
      </div>

      <PlaceChooserModal
        show={mapModalOpened}
        level={current}
        canGuess={canGuess}
        guesses={guesses}
        onHide={() => setMapModalOpened(false)}
        onConfirm={(marker, data, distance) => onGuess(marker, data, time.current, distance)}
        onNext={onNext}
      />

      <Hints
        hints={hints}
        hintsViewed={hintsViewed}
        show={hintsModalOpened}
        onHide={() => setHintsModalOpened(false)}
        onHintView={(hint: HintEntity) => onHintViewed(hint, time.current)}
      />
    </>
  );
};

export default Level;
