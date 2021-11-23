import { useJsApiLoader } from '@react-google-maps/api';
import React from 'react';

import { Routes, Route, Link } from 'react-router-dom';
import Game from './Game';

import Map from './Map';
import StreetView from './StreetView';

const COORDINATES = { lat: -20.3864301, lng: -43.5027689 };

const App: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded || loadError) {
    return null;
  }

  return (
    <div className="App">
      <nav>
        <Link to="/">Game</Link>
        <Link to="/street-view">Street View</Link>
        <Link to="/map">Map</Link>
      </nav>
      <div className="full">
        <Routes>
          <Route path="/" element={<Game />} />
          <Route path="street-view" element={<StreetView coordinates={COORDINATES} />} />
          <Route path="map" element={<Map coordinates={COORDINATES} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
