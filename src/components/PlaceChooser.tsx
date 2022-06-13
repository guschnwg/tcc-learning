import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { InfoWindow, Marker } from '@react-google-maps/api';
import useSWR from 'swr';
import Button from './Button';

import Map, { DEFAULT_COORDINATES, DEFAULT_ZOOM, getZoom } from './Map';
import Modal from './Modal';
import OpenStreetMapsData from './OpenStreetMapData';
import Spinner from './Spinner';

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

const PlaceChooserGuesses: React.FC<{ showInfoWindowId?: number, guesses: GuessEntity[], onGuessClick: (id?: number) => void }> = ({ showInfoWindowId, guesses, onGuessClick }) => {
  return (
    <>
      {guesses.sort((g1, g2) => g1.distance - g2.distance).map((guess, index) => {
        let color = "red";
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

        return (
          <Marker
            key={guess.id}
            zIndex={guesses.length + 1 - index}
            position={guess}
            icon={`https://maps.google.com/mapfiles/ms/icons/${color}.png`}
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

const PlaceChooser: React.FC<PlaceChooserProps> = ({ placeCoords, canGuess, guesses, onConfirm }) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [guessCoords, setGuessCoords] = useState<google.maps.LatLngLiteral>();
  const [showInfoWindowId, setShowInfoWindowId] = useState<number>();

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
            guesses={guesses}
            onGuessClick={setShowInfoWindowId}
          />

          {guessCoords && (
            <PlaceChooserMarker
              placeCoords={placeCoords}
              showInfoWindow={showInfoWindowId === -1}
              guessCoords={guessCoords}
              onShowInfoWindow={show => setShowInfoWindowId(show ? -1 : undefined)}
              onConfirm={async (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => {
                const guess = await onConfirm(marker, data, distance);
                setShowInfoWindowId(guess.id);
                setGuessCoords(undefined);
              }}
            />
          )}
        </Map>
      </div>
    </div>
  )
}

export const PlaceChooserModal: React.FC<PlaceChooserModalProps> = ({ show, canGuess, coordinates, guesses, onHide, onConfirm }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <PlaceChooser placeCoords={coordinates} canGuess={canGuess} guesses={guesses} onConfirm={onConfirm} />
    </Modal>
  );
};
