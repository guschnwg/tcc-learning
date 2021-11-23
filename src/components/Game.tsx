import React, { useState } from 'react';
import countries from 'i18n-iso-countries';
import ReactModal from 'react-modal';

import data from '../data.json';

import Flag from './Flag';
import Map from './Map';
import StreetView from './StreetView';
import Stopwatch from './Stopwatch';

const Game: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [modalOpened, setModalOpened] = useState(false);

  const current = data.levels[index];

  return (
    <div className="game-container full" key={index}>
      <StreetView coordinates={current.coordinates} />

      <div className="country-flag">
        <button onClick={() => setModalOpened((prev) => !prev)}>
          <Flag name={countries.getName(current.city.country, 'pt')} code={current.city.country} />
        </button>

        <button onClick={() => setIndex((prev) => prev + 1)}>Next</button>

        <Stopwatch />
      </div>

      <ReactModal
        isOpen={modalOpened}
        onRequestClose={() => setModalOpened(false)}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="full">
          <div className="full">
            <Map coordinates={current.coordinates} />
          </div>
        </div>
      </ReactModal>
    </div>
  );
}

export default Game;
