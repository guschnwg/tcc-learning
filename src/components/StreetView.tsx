import React from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { StreetViewPanorama } from '@react-google-maps/api';

interface Props {
  coordinates?: { lat: number; lng: number };
}

const defaultCoordinates = {
  lat: 10.99835602,
  lng: 77.01502627,
};

const StreetView: React.FC<Props> = ({ coordinates = defaultCoordinates }) => {
  const streetViewPanoramaOptions: google.maps.StreetViewPanoramaOptions = {
    position: coordinates,
    pov: { heading: 0, pitch: 0 },
    zoom: 1,
    visible: true,
    enableCloseButton: false,
  };

  return (
    <GoogleMap mapContainerStyle={{ height: '100%' }} center={coordinates} zoom={10}>
      <StreetViewPanorama options={streetViewPanoramaOptions} />
    </GoogleMap>
  );
};

export default StreetView;
