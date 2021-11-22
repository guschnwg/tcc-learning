import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

interface MapProps {
  coordinates?: { lat: number; lng: number };
}

const defaultCoordinates = {
  lat: 10.99835602,
  lng: 77.01502627,
};

export default function Map({ coordinates = defaultCoordinates }: MapProps) {
  return <GoogleMap mapContainerStyle={{ height: '100%' }} center={coordinates} zoom={10} />;
}
