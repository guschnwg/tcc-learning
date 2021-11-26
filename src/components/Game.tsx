import React, { useState } from 'react';

import data from '../data.json';

import Level from './Level';

const Game: React.FC = () => {
  const [index, setIndex] = useState(0);

  return <Level current={data.levels[index]} onNext={() => setIndex((prev) => prev + 1)} />;
};

export default Game;
