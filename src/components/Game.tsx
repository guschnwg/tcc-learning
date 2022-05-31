import React, { useState } from 'react';

import data from '../data.json';
import _userData from '../user-data.json';

import Level from './Level';
import Path from './Path';

const Game: React.FC = () => {
  const [index, setIndex] = useState(1);

  const [userData, setUserData] = useState<typeof _userData>(JSON.parse(JSON.stringify(_userData)));

  const handleHintViewed = (hintIndex: number, time: number) => {
    setUserData((prev: typeof userData) => {
      const theHint = {
        "id": hintIndex,
        "viewed": true,
        "timestamp": time,
      };
      const levelData = prev.find(ud => ud.level_id === index);
      if (levelData) {
        levelData.hints.push(theHint);
      } else {
        prev.push({
          "id": userData.length,
          "level_id": index,
          "hints": [theHint],
          "guesses": [],
          "completed": false,
        })
      }

      return [...prev];
    })
  }

  const handleNext = (toIndex?: number) => {
    setUserData((prev: typeof userData) => {
      const nextIndex = toIndex || index + 1;
      const levelData = prev.find(ud => ud.level_id === nextIndex);
      if (!levelData) {
        prev.push({
          "id": userData.length,
          "level_id": nextIndex,
          "hints": [],
          "guesses": [],
          "completed": false,
        })
      }

      return [...prev];
    })
    setIndex((prev) => toIndex || prev + 1)
  }

  const handleGuess = (data: OSMData, time: number, distance: number) => {
    setUserData((prev: typeof userData) => {
      const levelData = prev.find(ud => ud.level_id === index);
      const theGuess = {
        "id": levelData ? levelData.guesses.length + 1 : 1,
        "distance": distance,
        "timestamp": time,
        "hints_viewed": levelData ? levelData.hints.length : 0,
        "data": data,
      };
      if (levelData) {
        levelData.guesses.push(theGuess as any);
      } else {
        prev.push({
          "id": userData.length,
          "level_id": index,
          "hints": [],
          "guesses": [theGuess as any],
          "completed": false,
        })
      }

      return [...prev];
    })
  }

  return (
    <div className="full">
      <Level
        current={data.levels.find(l => l.id === index)!}
        userData={userData.find(ud => ud.level_id === index)!}
        onNext={handleNext}
        onGuess={handleGuess}
        onHintViewed={handleHintViewed}
      />

      <Path
        levels={data.levels}
        userData={userData}
        current={index}
        onLevelClick={handleNext}
      />
    </div>
  );
};

export default Game;
