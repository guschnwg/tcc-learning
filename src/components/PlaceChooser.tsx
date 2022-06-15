import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { InfoWindow, Marker } from '@react-google-maps/api';
import useSWR from 'swr';
import Button from './Button';

import Map, { DEFAULT_COORDINATES, DEFAULT_ZOOM, getZoom } from './Map';
import Modal from './Modal';
import OpenStreetMapsData, { isSameOSMPlace } from './OpenStreetMapData';
import Spinner from './Spinner';
import { haversineDistance } from '../utils';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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

const GuessInfo: React.FC<{ guess: GuessEntity, level: LevelEntity, onClose: () => void, onNext: () => void }> = ({ level, guess, onClose, onNext }) => {
  return (
    <Modal className="guess-info-modal" portalClassName="guess-info-modal-container" show onHide={onClose}>
      <h3>Seu palpite</h3>

      <OpenStreetMapsData data={guess.data}>
        <span>Distância: {guess.distance.toFixed(2)}km</span>

        <div className="guess-info-modal-actions">
          {isSameOSMPlace(level.data.address, guess.data.address) ? (
            <>
              <h4>Você acertou a cidade!</h4>

              <Button onClick={onNext}>
                Próximo
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>
              Tentar novamente
            </Button>
          )}
        </div>
      </OpenStreetMapsData>
    </Modal>
  )
}

const PlaceChooserMarker: React.FC<PlaceChooserMarkerProps> = ({ placeCoords, guessCoords, showInfoWindow, onShowInfoWindow, onConfirm }) => {
  const [showDistance, setShowDistance] = useState(false);
  const [ready, setReady] = useState(false);
  const distance = useMemo(() => {
    return haversineDistance(guessCoords, placeCoords);
  }, [guessCoords, placeCoords]);

  useEffect(() => {
    setShowDistance(false);
  }, [guessCoords])

  const handleConfirm = (data: OSMData) => {
    setShowDistance(true);
    onConfirm(guessCoords, data, distance);
  }

  return (
    <Marker
      position={guessCoords}
      zIndex={0}
      onClick={() => onShowInfoWindow(true)}
      onPositionChanged={() => onShowInfoWindow(true)}
      onLoad={() => setReady(true)}
    >
      {showInfoWindow && ready && (
        <InfoWindow onCloseClick={() => onShowInfoWindow(false)}>
          <React.Suspense fallback={<Spinner color="#323dbb" />}>
            <Data position={guessCoords} showConfirmButton={!showDistance} onConfirm={handleConfirm}>
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

const PlaceChooserGuesses: React.FC<{ showInfoWindowId?: number, level: LevelEntity, guesses: GuessEntity[], onGuessClick: (id?: number) => void }> = ({ showInfoWindowId, level, guesses, onGuessClick }) => {
  return (
    <>
      {guesses.sort((g1, g2) => g1.distance - g2.distance).map((guess, index) => {
        let color = "red";

        if (isSameOSMPlace(guess.data.address, level.data.address)) {
          color = "sunny";
        } else {
          if (guess.distance < 30) {
            color = "blue";
          } else if (guess.distance < 100) {
            color = "green";
          } else if (guess.distance < 300) {
            color = "yellow";
          } else if (guess.distance < 1000) {
            color = "orange";
          }

          if (index === 0) {
            color += "-dot";
          }
        }

        return (
          <Marker
            key={guess.id}
            zIndex={guesses.length + 1 - index}
            position={guess}
            icon={`https://maps.google.com/mapfiles/ms/micons/${color}.png`}
            onClick={() => onGuessClick(guess.id)}
          >
            {showInfoWindowId === guess.id && (
              <InfoWindow onCloseClick={() => onGuessClick(undefined)}>
                <OpenStreetMapsData data={guess.data}>
                  <span>Distância: {guess.distance.toFixed(2)}km</span>
                  <span>Palpite aos {guess.time_elapsed}s</span>
                </OpenStreetMapsData>
              </InfoWindow>
            )}
          </Marker>
        )}
      )}
    </>
  )
}

const PlaceChooser: React.FC<PlaceChooserProps> = ({ level, canGuess, guesses, onConfirm, onNext }) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [guessCoords, setGuessCoords] = useState<google.maps.LatLngLiteral>();
  const [showInfoWindowId, setShowInfoWindowId] = useState<number>();
  const [guessInfo, setGuessInfo] = useState<GuessEntity>();

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
            setShowInfoWindowId(-1);
            if (e.latLng && canGuess) {
              setGuessCoords(e.latLng.toJSON());
            }
          }}
        >
          <PlaceChooserGuesses
            showInfoWindowId={showInfoWindowId}
            level={level}
            guesses={guesses}
            onGuessClick={setShowInfoWindowId}
          />

          {guessCoords && (
            <PlaceChooserMarker
              placeCoords={level}
              showInfoWindow={showInfoWindowId === -1}
              guessCoords={guessCoords}
              onShowInfoWindow={show => setShowInfoWindowId(show ? -1 : undefined)}
              onConfirm={async (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => {
                setShowInfoWindowId(undefined);
                const guess = await onConfirm(marker, data, distance);
                setGuessInfo(guess);
                setGuessCoords(undefined);
              }}
            />
          )}

          {guessInfo && (
            <GuessInfo
              level={level}
              guess={guessInfo}
              onClose={() => setGuessInfo(undefined)}
              onNext={onNext}
            />
          )}
        </Map>
      </div>
    </div>
  )
}

export const PlaceChooserModal: React.FC<PlaceChooserModalProps> = ({ show, canGuess, level, guesses, onHide, onConfirm, onNext }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <PlaceChooser level={level} canGuess={canGuess} guesses={guesses} onConfirm={onConfirm} onNext={onNext} />
    </Modal>
  );
};
