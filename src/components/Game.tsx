import React, { useState } from 'react';

import data from '../data.json';
import userData from '../user-data.json';

import Level from './Level';
import Path from './Path';

const Game: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [, setPoints] = useState(0);

  return (
    <div className="full">
      <Level
        current={data.levels[index]}
        onNext={(points) => {
          setIndex((prev) => prev + 1)
          setPoints(prev => prev + points)
        }}
      />

      <Path
        levels={data.levels}
        userData={userData}
        current={index}
        onLevelClick={setIndex}
      />
    </div>
  );
};

export default Game;
