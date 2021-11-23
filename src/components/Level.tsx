import countries from 'i18n-iso-countries';
import React, { useState } from 'react';
import ReactModal from 'react-modal';
import data from '../data.json';

import Flag from './Flag';
import Map from './Map';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';

interface Props {
  current: typeof data.levels[number];
  onNext: () => void;
}

const Level: React.FC<Props> = ({ current, onNext }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [tipsModalOpened, setTipsModalOpened] = useState(false);

  return (
    <div className="game-container full">
      <StreetView coordinates={current.coordinates} />

      <div className="country-flag">
        <button onClick={() => setMapModalOpened((prev) => !prev)}>
          <Flag name={countries.getName(current.city.country, 'pt')} code={current.city.country} />
        </button>

        <button onClick={onNext}>Next</button>

        <button onClick={() => setTipsModalOpened((prev) => !prev)}>Tips</button>

        <Stopwatch />
      </div>

      <ReactModal
        isOpen={mapModalOpened}
        onRequestClose={() => setMapModalOpened(false)}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="full">
          <div className="full">
            <Map coordinates={current.coordinates} />
          </div>
        </div>
      </ReactModal>

      <ReactModal
        isOpen={tipsModalOpened}
        onRequestClose={() => setTipsModalOpened(false)}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="full">
          <ul>
            {current.history.map((sentence) => (
              <li key={sentence}>{sentence}</li>
            ))}
          </ul>
        </div>
      </ReactModal>
    </div>
  );
};

export default Level;
