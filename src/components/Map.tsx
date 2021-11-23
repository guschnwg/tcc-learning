import React, { useState } from 'react';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import useSWR from 'swr';
import Flag from './Flag';

interface Props {
  coordinates?: { lat: number; lng: number };
}

const defaultCoordinates = {
  lat: 10.99835602,
  lng: 77.01502627,
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Data = ({ position }: { position: google.maps.LatLngLiteral }) => {
  const { data } = useSWR(
    `https://nominatim.openstreetmap.org/reverse.php?lat=${position.lat}&lon=${position.lng}&zoom=18&format=jsonv2`,
    fetcher,
    { suspense: true }
  );

  return (
    <div>
      <span>hello {data.display_name}</span>
      <Flag name={data.address.country} code={((data.address.country_code as string) || '').toUpperCase()} />
    </div>
  );
};

const Map: React.FC<Props> = ({ coordinates = defaultCoordinates }) => {
  const [marker, setMarker] = useState<google.maps.LatLngLiteral>();
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  return (
    <GoogleMap
      mapContainerStyle={{ height: '100%' }}
      center={coordinates}
      zoom={10}
      onClick={(e) => {
        if (e.latLng) {
          setMarker(e.latLng.toJSON());
        }
      }}
    >
      {marker && (
        <Marker position={marker} onClick={() => setShowInfoWindow(true)}>
          {showInfoWindow && (
            <InfoWindow onCloseClick={() => setShowInfoWindow(false)}>
              <React.Suspense fallback={() => <span>Loading...</span>}>
                <Data position={marker} />
              </React.Suspense>
            </InfoWindow>
          )}
        </Marker>
      )}
    </GoogleMap>
  );
};

export default Map;
