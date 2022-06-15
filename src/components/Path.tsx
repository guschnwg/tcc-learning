import React, { useState } from "react"
import Button from "./Button";
import useDimensions from "react-use-dimensions";
import Modal from "./Modal";


interface Props {
  levels: LevelEntity[]
  bestGuesses: BestGuess[]
  current: number
  onLevelClick: (index: number) => void
}

interface LevelsProps extends Props {
  style?: React.CSSProperties
}

const Levels: React.FC<LevelsProps> = ({ style, bestGuesses, current, levels, onLevelClick }) => {
  return (
    <>
      {levels.map((level, index) => {
        const bestGuess = bestGuesses.find(g => g.level.id === level.id);

        return (
          <Button
            key={level.id}
            className={`path-content-level full ${current === index ? "current" : ""}`}
            onClick={() => onLevelClick(index)}
            style={style}
          >
            <span className={`level-number ${!bestGuess || !bestGuess.guess ? "never-tried" : ""}`}>{index + 1}</span>

            {bestGuess && bestGuess.guess && (
              <div className="best-guess-path">
                <span className="best-guess-path-title">Melhor palpite</span>
                <span>Distância: {bestGuess.guess.distance.toFixed(2)} km</span>
                <span>Dicas: {bestGuess.guess.hints_viewed}</span>
              </div>
            )}
          </Button>
        );
      })}
    </>
  )
}

const Path: React.FC<Props> = ({ levels, bestGuesses, current, onLevelClick }) => {
  const [show, setShow] = useState(false);
  const [ref, { width }] = useDimensions();

  let divider = 2;
  if (width > 2500) {
    divider = 7;
  } else if (width > 1800) {
    divider = 6;
  } else if (width > 1200) {
    divider = 5;
  } else if (width > 850) {
    divider = 4;
  } else if (width > 600) {
    divider = 3;
  }

  return (
    <>
      <Button onClick={() => setShow(prev => !prev)}>
        Níveis
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <div className="levels-container" ref={ref}>
          <Levels
            style={{
              width: (width || 0) / divider - 20,
              height: (width || 0) / divider - 20,
              margin: 10,
            }}
            levels={levels}
            bestGuesses={bestGuesses}
            current={current}
            onLevelClick={level => {
              onLevelClick(level);
              setShow(false);
            }}
          />
        </div>

        <div>Mais por vir...</div>
      </Modal>
    </>
  )
}

export default Path