import React from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { StreetViewPanorama } from '@react-google-maps/api';

interface MapProps {
  coordinates?: { lat: number; lng: number };
}

const defaultCoordinates = {
  lat: 10.99835602,
  lng: 77.01502627,
};

export default function StreetView({ coordinates = defaultCoordinates }: MapProps) {
  const streetViewPanoramaOptions: google.maps.StreetViewPanoramaOptions = {
    position: coordinates,
    pov: { heading: 0, pitch: 0 },
    zoom: 1,
    visible: true,
  };

  return (
    <GoogleMap mapContainerStyle={{ height: '100%' }} center={coordinates} zoom={10}>
      <StreetViewPanorama options={streetViewPanoramaOptions} />
    </GoogleMap>
  );
}
