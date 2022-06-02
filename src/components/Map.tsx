import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface Props {
  options?: google.maps.MapOptions
  coordinates?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: ((e: google.maps.MapMouseEvent) => void) | undefined;
}

export const DEFAULT_COORDINATES = {
  lat: -13.8860709,
  lng: -57.2789963,
};
export const DEFAULT_ZOOM = 4.5;

export function getZoom(lat_a: number, lng_a: number, lat_b: number, lng_b: number): number {
  function latRad(lat: number) {
    const sin = Math.sin(lat * Math.PI / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  const latDif = Math.abs(latRad(lat_a) - latRad(lat_b))
  const lngDif = Math.abs(lng_a - lng_b)

  const latFrac = latDif / Math.PI
  const lngFrac = lngDif / 360

  const lngZoom = Math.log(1 / latFrac) / Math.log(2)
  const latZoom = Math.log(1 / lngFrac) / Math.log(2)

  return Math.min(lngZoom, latZoom)
}

const Map: React.FC<Props> = ({ coordinates = DEFAULT_COORDINATES, zoom = DEFAULT_ZOOM, options = {}, children, onMapClick }) => {
  return (
    <GoogleMap mapContainerStyle={{ height: '100%' }} center={coordinates} zoom={zoom} options={options} onClick={onMapClick}>
      {children}
    </GoogleMap>
  );
};

export default Map;
