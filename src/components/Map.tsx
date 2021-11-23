import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface Props {
  coordinates?: { lat: number; lng: number };
}

const defaultCoordinates = {
  lat: 10.99835602,
  lng: 77.01502627,
};

const Map: React.FC<Props> = ({ coordinates = defaultCoordinates }) => {
  return <GoogleMap mapContainerStyle={{ height: '100%' }} center={coordinates} zoom={10} />;
}

export default Map;
