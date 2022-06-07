import React, { useRef, useState } from 'react';
import Button from './Button';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';
import { PlaceChooserModal } from './PlaceChooser';
import Hints from './Hints';

const Level: React.FC<LevelProps> = ({ current, guessLimit, userData, onNext, onGuess, onHintViewed, onTimePassed }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [hintsModalOpened, setHintsModalOpened] = useState(false);
  const time = useRef(0); // Not ideal, but :(

  const guesses = userData?.guesses || [];
  const canGuess = guessLimit === 0 || guesses.length < guessLimit;
  const hintsViewed = userData ? userData.hints.filter(h => h.viewed) : [];

  return (
    <div className="game-container full">
      <div className="game-header">
        <div>
          <Button onClick={() => setMapModalOpened((prev) => !prev)}>
            Palpitar {guesses.length}/{guessLimit === 0 ? "∞" : guessLimit}
          </Button>
          <Button onClick={() => setHintsModalOpened((prev) => !prev)}>
            Dicas {hintsViewed.length}/{current.hints.length}
          </Button>
        </div>

        <div>
          <Stopwatch
            key={current.id}
            start={userData?.current_time || 0}
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
          markers={current.markers}
          guesses={guesses}
          coordinates={current.coordinates}
        />
      </div>

      <PlaceChooserModal
        show={mapModalOpened}
        coordinates={current.coordinates}
        canGuess={canGuess}
        guesses={guesses}
        onHide={() => setMapModalOpened(false)}
        onConfirm={(marker, data, distance) => onGuess(marker, data, time.current, distance)}
      />

      <Hints
        hints={current.hints}
        hintsViewed={hintsViewed}
        show={hintsModalOpened}
        onHide={() => setHintsModalOpened(false)}
        onTipView={(index: number) => onHintViewed(index, time.current)}
      />
    </div>
  );
};

export default Level;
