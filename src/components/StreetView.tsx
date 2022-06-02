import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { StreetViewPanorama } from '@react-google-maps/api';

interface Props {
  coordinates?: google.maps.LatLngLiteral;
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
    disableDefaultUI: true,
  };

  return (
    <>
      <GoogleMap mapContainerStyle={{ height: '100%' }} center={coordinates} zoom={10}>
        <StreetViewPanorama options={streetViewPanoramaOptions} />

        <Marker position={coordinates} />
      </GoogleMap>
    </>
  );
};

export default StreetView;
