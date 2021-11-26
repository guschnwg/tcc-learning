import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import data from '../data.json';

import Flag from './Flag';
import Map from './Map';
import Modal from './Modal';
import Stopwatch from './Stopwatch';
import StreetView from './StreetView';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Data = ({ position }: { position: google.maps.LatLngLiteral }) => {
  const { data } = useSWR(
    `https://nominatim.openstreetmap.org/reverse.php?lat=${position.lat}&lon=${position.lng}&zoom=18&format=jsonv2`,
    fetcher,
    { suspense: true }
  );

  return (
    <div>
      <span>{data.display_name}</span>

      <Flag
        name={data.address.country}
        code={((data.address.country_code as string) || '').toUpperCase()}
      />
    </div>
  );
};

const PlaceChooser = ({ show, onHide, onConfirm }: any) => {
  const [marker, setMarker] = useState<google.maps.LatLngLiteral>();
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  return (
    <Modal
      show={show}
      onHide={onHide}
    >
      <div className="full">
        <div className="full">
          <Map
            onMapClick={
              (e) => {
                if (e.latLng) {
                  setMarker(e.latLng.toJSON());
                }
              }
            }
          >
            {marker && (
              <Marker
                position={marker}
                onClick={() => setShowInfoWindow(true)}
                onLoad={() => setShowInfoWindow(true)}
              >
                {showInfoWindow && (
                  <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
                    <React.Suspense fallback={<span>Loading...</span>}>
                      <Data position={marker} />

                      <button onClick={onConfirm}>Confirm</button>
                    </React.Suspense>
                  </InfoWindow>
                )}
              </Marker>
            )}
          </Map>
        </div>
      </div>
    </Modal>
  )
}

const Tips = ({ tips, show, onHide, onTipView }: any) => {
  const [visible, setVisible] = useState<string[]>([])

  useEffect(() => {
    if (onTipView) {
      onTipView(visible);
    }
  }, [visible, onTipView])

  return (
    <Modal
      show={show}
      onHide={onHide}
    >
      <div className="full">
        <ul>
          {tips.map((sentence: string) => {
            if (visible.includes(sentence)) {
              return (
                <li key={sentence}>{sentence}</li>
              )
            }
            return (
              <li key={sentence}>
                Escondido
                <button onClick={() => setVisible(prev => [...prev, sentence])}>Mostrar</button>
              </li>
            )
          })}
        </ul>
      </div>
    </Modal>
  )
}

interface Props {
  current: typeof data.levels[number];
  onNext: () => void;
}

const Level: React.FC<Props> = ({ current, onNext }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [tipsModalOpened, setTipsModalOpened] = useState(false);
  const [tipsViewed, setTipsViewed] = useState<string[]>([]);

  return (
    <div className="game-container full">
      <StreetView coordinates={current.coordinates} />

      <div className="country-flag">
        <button onClick={() => setMapModalOpened((prev) => !prev)}>
          Palpitar
        </button>

        <button onClick={onNext}>
          Pular
        </button>

        <button onClick={() => setTipsModalOpened((prev) => !prev)}>
          Dicas {tipsViewed.length}/{current.history.length}
        </button>

        <Stopwatch />
      </div>

      <PlaceChooser
        show={mapModalOpened}
        onHide={() => setMapModalOpened(false)}
        onConfirm={() => {
          setMapModalOpened(false)
          onNext();
        }}
      />

      <Tips
        tips={current.history}
        show={tipsModalOpened}
        onHide={() => setTipsModalOpened(false)}
        onTipView={(viewed: string[]) => setTipsViewed(viewed)}
      />
    </div>
  );
};

export default Level;
