import React, { useState } from "react"
import Button from "./Button";
import useDimensions from "react-use-dimensions";
import Modal from "./Modal";


interface Props {
    levels: Level[]
    userData: UserLevel[]
    current: number
    onLevelClick: (index: number) => void
}

const Levels: React.FC<Props & { style?: React.CSSProperties }> = ({ style = {}, current, levels, userData, onLevelClick }) => {
    return (
        <>
            {levels.map(level => {
                const data = userData.find(d => d.level_id === level.id);

                let bestGuess = null;
                if (data && data.guesses) {
                    bestGuess = data.guesses.sort((g1, g2) => g1.distance - g2.distance)[0];
                }

                return (
                    <Button
                        key={level.id}
                        className={`path-content-level full ${current === level.id ? "current" : ""}`}
                        onClick={() => onLevelClick(level.id)}
                        style={style}
                    >
                        <span className={`level-number ${!bestGuess ? "never-tried" : ""}`}>{level.id}</span>

                        {bestGuess && (
                            <div className="best-guess-path">
                                <span className="best-guess-path-title">Melhor palpite</span>
                                <span>Distância: {bestGuess.distance.toFixed(2)} km</span>
                                <span>Dicas: {bestGuess.hints_viewed}</span>
                            </div>
                        )}
                    </Button>
                );
            })}
        </>
    )
}

const Path: React.FC<Props> = ({ levels, userData, current, onLevelClick }) => {
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
        <div className="path-container shown">
            <Button onClick={() => setShow(prev => !prev)}>
                Níveis
            </Button>

            <Modal show={show} onHide={() => setShow(false)}>
                <div className="levels-container" ref={ref}>
                    <Levels
                        style={{
                            width: width / divider - 20,
                            height: width / divider - 20,
                            margin: 10,
                        }}
                        levels={levels}
                        userData={userData}
                        current={current}
                        onLevelClick={level => {
                            onLevelClick(level);
                            setShow(false);
                        }}
                    />
                </div>

                <div>Mais por vir...</div>
            </Modal>
        </div>
    )
}

export default Path