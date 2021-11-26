import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface Props {
  coordinates?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: ((e: google.maps.MapMouseEvent) => void) | undefined
}

const defaultCoordinates = {
  lat: -13.8860709,
  lng: -57.2789963,
};
const defaultZoom = 4.5;

const Map: React.FC<Props> = ({ coordinates = defaultCoordinates, zoom = defaultZoom, children, onMapClick }) => {
  return (
    <GoogleMap
      mapContainerStyle={{ height: '100%' }}
      center={coordinates}
      zoom={zoom}
      onClick={onMapClick}
    >
      {children}
    </GoogleMap>
  );
};

export default Map;
