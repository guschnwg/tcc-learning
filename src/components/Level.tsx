import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useRef, useState } from 'react';
import useSWR from 'swr';
import data from '../data.json';
import Button from './Button';

import Flag from './Flag';
import Map from './Map';
import Modal from './Modal';
import Spinner from './Spinner';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Data = ({ position }: { position: google.maps.LatLngLiteral }) => {
  const { data } = useSWR(
    `https://nominatim.openstreetmap.org/reverse.php?lat=${position.lat}&lon=${position.lng}&zoom=18&format=jsonv2`,
    fetcher,
    { suspense: true }
  );

  console.log(data);

  return (
    <div className="data-container">
      <ul>
        <li>Cidade: {data.address.town}</li>
        <li>Estado: {data.address.state}</li>
        <li>Região: {data.address.region || ":("}</li>
        <li>
          País: {data.address.country}
          <Flag name={data.address.country} code={((data.address.country_code as string) || '').toUpperCase()} />
        </li>
      </ul>
    </div>
  );
};

const PlaceChooser = ({ marker, onMapClick, onConfirm }: any) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  return (
    <div className="full">
      <div className="full">
        <Map
          onMapClick={onMapClick}
        >
          {marker && (
            <Marker position={marker} onClick={() => setShowInfoWindow(true)} onLoad={() => setShowInfoWindow(true)}>
              {showInfoWindow && (
                <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                  <React.Suspense fallback={<Spinner color="#323dbb" />}>
                    <Data position={marker} />

                    <Button onClick={onConfirm}>Confirmar</Button>
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

const PlaceChooserModal = ({ show, onHide, onConfirm }: any) => {
  const [marker, setMarker] = useState<google.maps.LatLngLiteral>();
  
  return (
    <Modal show={show} onHide={onHide}>
      <PlaceChooser
        marker={marker}
        onMapClick={(e: any) => {
          if (e.latLng) {
            setMarker(e.latLng.toJSON());
          }
        }}
        onConfirm={onConfirm}
      />
    </Modal>
  );
};

const Tips = ({ tips, tipsViewed, show, onHide, onTipView }: any) => {
  return (
    <Modal show={show} onHide={onHide}>
      <div className="full">
        <ul>
          {tips.map((tip: string) => {
            if (tipsViewed.includes(tip)) {
              return <li key={tip}>{tip}</li>;
            }
            return (
              <li key={tip}>
                Escondido
                <Button onClick={() => onTipView(tip)}>Mostrar</Button>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
};

interface Props {
  current: typeof data.levels[number];
  onNext: (points: number) => void;
}

const Level: React.FC<Props> = ({ current, onNext }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [tipsModalOpened, setTipsModalOpened] = useState(false);
  const [tipsViewed, setTipsViewed] = useState<string[]>([]);
  const time = useRef(0); // Not ideal, but :(
  const extraPoints = tipsViewed.length * 100;

  return (
    <div className="game-container full">
      <div className="game-header">
        <div>
          <Button onClick={() => setMapModalOpened((prev) => !prev)}>Palpitar</Button>
          <Button onClick={() => setTipsModalOpened((prev) => !prev)}>
            Dicas {tipsViewed.length}/{current.history.length}
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
          <Button
            onClick={() => {
              setTipsViewed([]);
              onNext(time.current + extraPoints);
            }}
          >Pular</Button>
        </div>
      </div>

      <div className="game-body full-height">
        <StreetView coordinates={current.coordinates} />
      </div>

      <PlaceChooserModal
        show={mapModalOpened}
        onHide={() => setMapModalOpened(false)}
        onConfirm={() => {
          setMapModalOpened(false);
          onNext(time.current + extraPoints);
        }}
      />

      <Tips
        tips={current.history}
        tipsViewed={tipsViewed}
        show={tipsModalOpened}
        onHide={() => setTipsModalOpened(false)}
        onTipView={(tip: string) => setTipsViewed(prev => [...prev, tip])}
      />
    </div>
  );
};

export default Level;
