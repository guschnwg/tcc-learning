import { useJsApiLoader } from '@react-google-maps/api';
import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Game from './Game';
import Leaderboard from './Leaderboard';
import Debug from './Debug';
import { ConfigContextProvider } from './Config';


const App: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ["geometry", "places"],
  });

  if (!isLoaded || loadError) {
    return null;
  }

  return (
    <ConfigContextProvider>
      <div className="App">
        <div className="full">
          <Routes>
            <Route path="/" element={<Game />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/debug" element={<Debug />} />
          </Routes>
        </div>
      </div>
    </ConfigContextProvider>
  );
};

export default App;
