import { useState } from 'react';
import countries from 'i18n-iso-countries';
import ReactModal from 'react-modal';
import { useStopwatch, useTimer } from 'react-timer-hook';

import data from '../data.json';

import Flag from './Flag';
import Map from './Map';
import StreetView from './StreetView';


export default function Game() {
  const [index, setIndex] = useState(0);
  const [modalOpened, setModalOpened] = useState(false);
  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
  } = useStopwatch({ autoStart: true });


  const current = data.levels[index];

  return (
    <div className="game-container full" key={index}>
      <StreetView
        coordinates={current.coordinates}
      />

      <div className="country-flag">
        <button onClick={() => setModalOpened(prev => !prev)}>
          <Flag
            name={countries.getName(current.city.country, "pt")}
            code={current.city.country}
          />
        </button>

        <button onClick={() => setIndex(prev => prev + 1)}>
          Next
        </button>

        <div style={{ fontSize: '100px' }}>
          <span>{seconds + minutes * 60 + hours * 60 * 60 + days * 60 * 60* 24}</span>
        </div>
        <p>{isRunning ? 'Running' : 'Not running'}</p>
        <button onClick={start}>Start</button>
        <button onClick={pause}>Pause</button>
        <button onClick={() => {
          // Restarts to 5 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 300);
        }}>Restart</button>
      </div>

      <ReactModal
        isOpen={modalOpened}
        onRequestClose={() => setModalOpened(false)}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
      >
        <div className="full">
          <div className="full">
            <Map
              coordinates={current.coordinates}
            />
          </div>
        </div>
      </ReactModal>
    </div>
  );
}