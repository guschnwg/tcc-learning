import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useRef, useState } from 'react';
import useSWR from 'swr';
import _data from '../data.json';
import _userData from '../user-data.json';
import Button from './Button';

import Map from './Map';
import Modal from './Modal';
import OpenStreetMapsData from './OpenStreetMapData';
import Spinner from './Spinner';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const haversineDistance = (mk1: google.maps.LatLngLiteral, mk2: google.maps.LatLngLiteral) => {
  const R = 3958.8; // Radius of the Earth in miles
  const rlat1 = mk1.lat * (Math.PI / 180); // Convert degrees to radians
  const rlat2 = mk2.lat * (Math.PI / 180); // Convert degrees to radians
  const difflat = rlat2 - rlat1; // Radian difference (latitudes)
  const difflon = (mk2.lng - mk1.lng) * (Math.PI / 180); // Radian difference (longitudes)

  const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
  return d;
}

const Data = ({ position, onConfirm }: { position: google.maps.LatLngLiteral, onConfirm: (data: OSMData) => void }) => {
  const { data } = useSWR(
    `https://nominatim.openstreetmap.org/reverse.php?lat=${position.lat}&lon=${position.lng}&zoom=18&format=jsonv2`,
    fetcher,
    { suspense: true }
  );

  if (data.error || !data.address) {
    return <span className='data-container'>Not able to get data, try again.</span>;
  }

  return (
    <>
      <OpenStreetMapsData data={data} />

      <Button onClick={() => onConfirm(data)}>Confirmar</Button>
    </>
  )
};

const PlaceChooser: React.FC<PlaceChooserProps> = ({ marker, onMapClick, onConfirm }) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  return (
    <div className="full">
      <div className="full">
        <Map
          onMapClick={onMapClick}
        >
          {marker && (
            <Marker
              position={marker}
              onClick={() => setShowInfoWindow(true)}
              onPositionChanged={() => setShowInfoWindow(true)}
              onLoad={() => setShowInfoWindow(true)}
            >
              {showInfoWindow && (
                <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                  <React.Suspense fallback={<Spinner color="#323dbb" />}>
                    <Data position={marker} onConfirm={onConfirm} />
                  </React.Suspense>
                </InfoWindow>
              )}
            </Marker>
          )}
        </Map>
      </div>
    </div>
  )
}

const PlaceChooserModal = ({ show, onHide, onConfirm }: PlaceChooserModalProps) => {
  const [marker, setMarker] = useState<google.maps.LatLngLiteral>();

  return (
    <Modal show={show} onHide={onHide}>
      <PlaceChooser
        marker={marker}
        onMapClick={e => {
          if (e.latLng) {
            setMarker(e.latLng.toJSON());
          }
        }}
        onConfirm={(data: OSMData) => {
          if (marker) {
            onConfirm(marker, data);
          }
        }}
      />
    </Modal>
  );
};

interface HintsProps {
  hints: typeof _data.levels[number]["hints"]
  hintsViewed: typeof _userData[number]["hints"]
  show: boolean
  onHide: () => void
  onTipView: (index: number) => void
}

const Hints = ({ hints, hintsViewed, show, onHide, onTipView }: HintsProps) => {
  return (
    <Modal show={show} onHide={onHide}>
      <div className="full">
        <ul>
          {hints.map((hint) => {
            if (hintsViewed.find(h => h.id === hint.id)) {
              return <li key={hint.id}>{hint.description}</li>;
            }
            return (
              <li key={hint.id}>
                <Button onClick={() => onTipView(hint.id)}>Mostrar</Button>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
};

interface Props {
  current: Level;
  userData?: UserLevel;
  onNext: () => void
  onGuess: (data: OSMData, time: number, distance: number) => void;
  onHintViewed: (index: number, time: number) => void;
}

const Level: React.FC<Props> = ({ current, userData, onNext, onGuess, onHintViewed }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [hintsModalOpened, setHintsModalOpened] = useState(false);
  const time = useRef(0); // Not ideal, but :(

  const hintsViewed = userData ? userData.hints.filter(h => h.viewed) : [];
  const extraPoints = hintsViewed.length * 100;

  return (
    <div className="game-container full">
      <div className="game-header">
        <div>
          <Button onClick={() => setMapModalOpened((prev) => !prev)}>Palpitar</Button>
          <Button onClick={() => setHintsModalOpened((prev) => !prev)}>
            Dicas {hintsViewed.length}/{current.hints.length}
          </Button>
        </div>

        <div>
          <Stopwatch key={current.id} onChange={total => time.current = total}>
            {extraPoints ? (
              <span className="stopwatch-extra">
                (+{extraPoints})
              </span>
            ) : null}
          </Stopwatch>
        </div>

        <div>
          <Button onClick={() => onNext()}>Pular</Button>
        </div>
      </div>

      <div className="game-body full-height">
        <StreetView coordinates={current.coordinates} />
      </div>

      <PlaceChooserModal
        show={mapModalOpened}
        onHide={() => setMapModalOpened(false)}
        onConfirm={(location, data) => {
          onGuess(data, time.current, haversineDistance(location, current.coordinates));
        }}
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
