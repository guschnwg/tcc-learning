import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Circle, InfoWindow, Marker } from '@react-google-maps/api';
import useSWR from 'swr';
import Button from './Button';

import Map, { DEFAULT_COORDINATES, DEFAULT_ZOOM, getZoom } from './Map';
import Modal from './Modal';
import OpenStreetMapsData, { isSameOSMPlace } from './OpenStreetMapData';
import Spinner from './Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestion } from '@fortawesome/free-solid-svg-icons'

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

const GuessInfo: React.FC<{ canGuess: boolean, guess: GuessEntity, level: LevelEntity, onClose: () => void, onNext: () => void }> = ({ canGuess, level, guess, onClose, onNext }) => {
  let action = null;
  if (isSameOSMPlace(level.data.address, guess.data.address)) {
    action = (
      <>
        <h4>Você acertou a cidade!</h4>

        <Button onClick={onNext}>
          Próximo
        </Button>
      </>
    );
  } else if (canGuess) {
    action = (
      <Button onClick={onClose}>
        Tentar novamente
      </Button>
    );
  } else {
    action = (
      <>
        <h4>Nenhuma tentativa restante</h4>

        <Button onClick={onNext}>
          Próximo
        </Button>
      </>
    )
  }

  return (
    <Modal className="guess-info-modal" portalClassName="guess-info-modal-container" show onHide={onClose}>
      <h3>Seu palpite</h3>

      <OpenStreetMapsData data={guess.data}>
        <span>Distância: {(guess.distance / 1000).toFixed(2)}km</span>

        {action && <div className="guess-info-modal-actions">{action}</div>}
      </OpenStreetMapsData>
    </Modal>
  )
}

const PlaceChooserMarker: React.FC<PlaceChooserMarkerProps> = ({ placeCoords, guessCoords, showInfoWindow, onShowInfoWindow, onConfirm }) => {
  const [showDistance, setShowDistance] = useState(false);
  const [ready, setReady] = useState(false);
  const distance = useMemo(() => {
    return window.google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(guessCoords),
      new google.maps.LatLng(placeCoords)
    );
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
                <span>Distância: {(distance / 1000).toFixed(2)}km</span>
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
          if (guess.distance < 30 * 1000) {
            color = "blue";
          } else if (guess.distance < 100 * 1000) {
            color = "green";
          } else if (guess.distance < 300 * 1000) {
            color = "yellow";
          } else if (guess.distance < 1000 * 1000) {
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
                  <span>Distância: {(guess.distance / 1000).toFixed(2)}km</span>
                  <span>Palpite aos {guess.time_elapsed}s</span>
                </OpenStreetMapsData>
              </InfoWindow>
            )}

            {showInfoWindowId === guess.id && (
              <Circle
                center={guess}
                radius={guess.distance}
                options={{ strokeWeight: 1 }}
              />
            )}
          </Marker>
        )
      }
      )}
    </>
  )
}

const PlaceChooserHelpModal: React.FC<{ container: React.RefObject<HTMLDivElement>, show: boolean, onClose: () => void }> = ({ container, show, onClose }) => {
  const markers = [
    { label: "Acertou na mosca! Mesma cidade", image: "https://maps.google.com/mapfiles/ms/micons/sunny.png" },
    { label: "Quando tem um ponto no meio do marcador, é o seu melhor palpite", image: "https://maps.google.com/mapfiles/ms/micons/blue-dot.png" },
    { label: "Pertinho! Menos de 30km, mas ainda não é a cidade certa!", image: "https://maps.google.com/mapfiles/ms/micons/blue.png" },
    { label: "Ficando quente! Entre 30km e 100km", image: "https://maps.google.com/mapfiles/ms/micons/green.png" },
    { label: "Chegando perto! Entre 100km e 300km", image: "https://maps.google.com/mapfiles/ms/micons/yellow.png" },
    { label: "Um pouco longe ainda! Entre 300km e 1000km", image: "https://maps.google.com/mapfiles/ms/micons/orange.png" },
    { label: "Muito longe! Mais de 1000km de distância", image: "https://maps.google.com/mapfiles/ms/micons/red.png" },
  ]


  return (
    <Modal container={container.current} className="place-chooser-tutorial" portalClassName="place-chooser-tutorial-container" show={show} onHide={onClose}>
      <h3>Como dar um palpite?</h3>

      <ul>
        <li>Clique em qualquer lugar do mapa, e espere carregar as informações</li>
        <li>Clique em &quot;Confirmar&quot;</li>
      </ul>


      <h3>Legenda dos marcadores</h3>

      {markers.map(marker => (
        <div key={marker.image}>
          <img src={marker.image} height={24} width={24} alt={marker.label} />
          <h4>{marker.label}</h4>
        </div>
      ))}

      <Button className="full-width" onClick={onClose}>
        Vamos lá!
      </Button>
    </Modal>
  );
}

const PlaceChooser: React.FC<PlaceChooserProps> = ({ level, canGuess, guesses, onConfirm, onNext }) => {
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [guessCoords, setGuessCoords] = useState<google.maps.LatLngLiteral>();
  const [showInfoWindowId, setShowInfoWindowId] = useState<number>();
  const [guessInfo, setGuessInfo] = useState<GuessEntity>();
  const [showHelp, setShowHelp] = useState(false);

  const container = useRef<HTMLDivElement>(null);

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

          <Button type="button" onClick={() => setShowHelp(true)}>
            <FontAwesomeIcon icon={faQuestion} />
          </Button>
        </form>
      </div>
      <div ref={container} className="place-chooser-map-container">
        <Map
          coordinates={mapCenter}
          zoom={zoom}
          options={{ clickableIcons: false, streetViewControl: false }}
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
              canGuess={canGuess}
              level={level}
              guess={guessInfo}
              onClose={() => setGuessInfo(undefined)}
              onNext={onNext}
            />
          )}
        </Map>
      </div>

      <PlaceChooserHelpModal container={container} show={showHelp} onClose={() => setShowHelp(false)} />
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
