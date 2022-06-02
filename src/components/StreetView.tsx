import React, { useRef, useState } from 'react';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { StreetViewPanorama } from '@react-google-maps/api';
import OpenStreetMapsData from './OpenStreetMapData';

interface Props {
  markers?: LevelMarker[]
  guesses?: Guess[]
  coordinates?: google.maps.LatLngLiteral
}

interface StreetViewMarkerProps {
  streetViewPanorama: google.maps.StreetViewPanorama
  coordinates?: google.maps.LatLngLiteral
}

const defaultCoordinates = {
  lat: 10.99835602,
  lng: 77.01502627,
};

const StreetViewMarker: React.FC<StreetViewMarkerProps> = ({ streetViewPanorama, coordinates, children }) => {
  const [marker, setMarker] = useState<google.maps.Marker>();
  const infoWindowRef = useRef<InfoWindow>(null);

  if (!coordinates) {
    return null;
  }

  return (
    <Marker
      position={coordinates}
      onLoad={(e) => setMarker(e)}
      onClick={() => {
        if (infoWindowRef.current && infoWindowRef.current.state.infoWindow) {
          infoWindowRef.current.state.infoWindow.open(streetViewPanorama);
        }
      }}
    >
      {children && marker && (
        <InfoWindow
          ref={infoWindowRef}
          options={{pixelOffset: new google.maps.Size(0, -50, 'px', 'px')}}
        >
          {children}
        </InfoWindow>
      )}
    </Marker>
  )
}

const StreetView: React.FC<Props> = ({ markers = [], guesses = [], coordinates = defaultCoordinates }) => {
  const [showMarkers] = useState(false);
  const [streetViewPanorama, setStreetViewPanorama] = useState<google.maps.StreetViewPanorama>();

  const streetViewPanoramaOptions: google.maps.StreetViewPanoramaOptions = {
    clickToGo: true,
    position: coordinates,
    pov: { heading: 0, pitch: 0 },
    zoom: 1,
    visible: true,
    enableCloseButton: false,
    disableDefaultUI: true,
  };

  return (
    <>
      <GoogleMap
        mapContainerStyle={{ height: '100%' }}
        center={coordinates}
        zoom={10}
      >
        <StreetViewPanorama
          onLoad={e => setStreetViewPanorama(e)}
          options={streetViewPanoramaOptions}
        />

        {showMarkers && streetViewPanorama && (
          <>
            <StreetViewMarker
              streetViewPanorama={streetViewPanorama}
              coordinates={coordinates}
            >
              <span>This is the initial location</span>
            </StreetViewMarker>

            {guesses.map(guess => (
              <StreetViewMarker
                key={guess.id}
                streetViewPanorama={streetViewPanorama}
                coordinates={{ lat: Number(guess.data.lat), lng: Number(guess.data.lon) }}
              >
                <OpenStreetMapsData data={guess.data} />
              </StreetViewMarker>
            ))}

            {markers.map((marker, index) => (
              <StreetViewMarker
                key={index}
                streetViewPanorama={streetViewPanorama}
                coordinates={marker.coordinates}
              >
                <span>{marker.data}</span>
              </StreetViewMarker>
            ))}
          </>
        )}
      </GoogleMap>
    </>
  );
};

export default StreetView;
