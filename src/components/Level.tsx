import { InfoWindow, Marker } from '@react-google-maps/api';
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import _data from '../data.json';
import _userData from '../user-data.json';
import Button from './Button';

import Map, { DEFAULT_COORDINATES, DEFAULT_ZOOM, getZoom } from './Map';
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

const Data: React.FC<{ position: google.maps.LatLngLiteral, showConfirmButton: boolean, onConfirm?: (data: OSMData) => void }> = ({ position, showConfirmButton, onConfirm, children }) => {
  const { data } = useSWR(
    `https://nominatim.openstreetmap.org/reverse.php?lat=${position.lat}&lon=${position.lng}&zoom=18&format=jsonv2`,
    fetcher,
    { suspense: true }
  );

  if (data.error || !data.address) {
    return <span className='data-container'>Não consegui localizar, tente novamente.</span>;
  }

  return (
    <>
      <OpenStreetMapsData data={data}>
        {children}
      </OpenStreetMapsData>

      {showConfirmButton && <Button onClick={() => onConfirm && onConfirm(data)}>Confirmar</Button>}
    </>
  );
};

const PlaceChooserMarker: React.FC<{ coordinates: google.maps.LatLngLiteral, marker: google.maps.LatLngLiteral, onConfirm: (data: OSMData, distance: number) => void }> = ({ coordinates, marker, onConfirm }) => {
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [showDistance, setShowDistance] = useState(false);
  const distance = useMemo(() => {
    return haversineDistance(marker, coordinates);
  }, [marker, coordinates]);

  useEffect(() => {
    setShowDistance(false);
  }, [marker])

  const handleConfirm = (data: OSMData) => {
    setShowDistance(true);
    onConfirm(data, distance);
  }

  return (
    <Marker
      position={marker}
      onClick={() => setShowInfoWindow(true)}
      onPositionChanged={() => setShowInfoWindow(true)}
      onLoad={() => setShowInfoWindow(true)}
    >
      {showInfoWindow && (
        <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
          <React.Suspense fallback={<Spinner color="#323dbb" />}>
            <Data position={marker} showConfirmButton={!showDistance} onConfirm={handleConfirm}>
              {showDistance && (
                <span>Distância: {distance.toFixed(2)}km</span>
              )}
            </Data>
          </React.Suspense>
        </InfoWindow>
      )}
    </Marker>
  )
}

const PlaceChooserGuesses: React.FC<{ guesses: Guess[] }> = ({ guesses }) => {
  const [showInfoWindowId, setShowInfoWindowId] = useState<number>();

  return (
    <>
      {guesses.map(guess => {
        const marker = { lat: Number(guess.data.lat), lng: Number(guess.data.lon) };
        return (
          <Marker
            key={guess.id}
            position={marker}
            icon="https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            onClick={() => setShowInfoWindowId(guess.id)}
          >
            {showInfoWindowId === guess.id && (
              <InfoWindow onCloseClick={() => setShowInfoWindowId(guess.id)}>
                <React.Suspense fallback={<Spinner color="#323dbb" />}>
                  <Data position={marker} showConfirmButton={false}>
                    <span>Distância: {guess.distance.toFixed(2)}km</span>
                    <span>Palpite aos {guess.timestamp}s</span>
                  </Data>
                </React.Suspense>
              </InfoWindow>
            )}
          </Marker>
        )}
      )}
    </>
  )
}

const PlaceChooser: React.FC<PlaceChooserProps> = ({ coordinates, guesses, onConfirm }) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [marker, setMarker] = useState<google.maps.LatLngLiteral>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const locale = (event.target as HTMLFormElement)["locale"].value;
    const encoded = encodeURIComponent(locale);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search.php?q=${encoded}&polygon_geojson=1&format=jsonv2`
    )
    const data = await response.json();

    if (data && data[0]) {
      setMapCenter({
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      });
      const zoom = getZoom(
        Number(data[0].boundingbox[0]),
        Number(data[0].boundingbox[2]),
        Number(data[0].boundingbox[1]),
        Number(data[0].boundingbox[3]),
      )
      setZoom(zoom);
    }
  }

  return (
    <div className="place-chooser-container">
      <div className="search-place-form">
        <form onSubmit={handleSubmit}>
          <input name="locale" id="locale" />
          <Button>Pesquisar</Button>
        </form>
      </div>
      <div className="place-chooser-map-container">
        <Map
          coordinates={mapCenter}
          zoom={zoom}
          options={{ clickableIcons: false }}
          onMapClick={e => {
            if (e.latLng) {
              setMarker(e.latLng.toJSON());
            }
          }}
        >
          <PlaceChooserGuesses guesses={guesses} />

          {marker && (
            <PlaceChooserMarker
              coordinates={coordinates}
              marker={marker}
              onConfirm={onConfirm} 
            />
          )}
        </Map>
      </div>
    </div>
  )
}

const PlaceChooserModal: React.FC<PlaceChooserModalProps> = ({ show, coordinates, guesses, onHide, onConfirm }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <PlaceChooser coordinates={coordinates} guesses={guesses} onConfirm={onConfirm} />
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
      <ul>
        {hints.map((hint) => {
          const hintView = hintsViewed.find(h => h.id === hint.id);
          if (hintView) {
            return <li key={hint.id}>{hint.description} - Visto aos {hintView.timestamp}s</li>;
          }

          return (
            <li key={hint.id}>
              <Button onClick={() => onTipView(hint.id)}>Mostrar</Button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};

interface Props {
  current: Level;
  userData?: UserLevel;
  onNext: () => void
  onGuess: (data: OSMData, time: number, distance: number) => void;
  onHintViewed: (index: number, time: number) => void;
  onTimePassed: (time: number) => void
}

const Level: React.FC<Props> = ({ current, userData, onNext, onGuess, onHintViewed, onTimePassed }) => {
  const [mapModalOpened, setMapModalOpened] = useState(false);
  const [hintsModalOpened, setHintsModalOpened] = useState(false);
  const time = useRef(0); // Not ideal, but :(

  const hintsViewed = userData ? userData.hints.filter(h => h.viewed) : [];

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
          guesses={userData?.guesses || []}
          coordinates={current.coordinates}
        />
      </div>

      <PlaceChooserModal
        show={mapModalOpened}
        coordinates={current.coordinates}
        guesses={userData?.guesses || []}
        onHide={() => setMapModalOpened(false)}
        onConfirm={(data, distance) => {
          onGuess(data, time.current, distance);
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
