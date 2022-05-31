import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import React, { useRef, useState } from "react"
import data from '../data.json';
import _userData from '../user-data.json';
import Button from "./Button";
import "slick-carousel/slick/slick.css";
import useDimensions from "react-use-dimensions";
import Slider, { Settings } from "react-slick";
import OpenStreetMapsData from "./OpenStreetMapData";


interface Props {
    levels: typeof data.levels
    userData: typeof _userData
    current: number
    onLevelClick: (index: number) => void
}

const Path: React.FC<Props> = ({ levels, userData, current, onLevelClick }) => {
    const [show, setShow] = useState(false);
    const stateClass = show ? "shown" : "hidden"
    const sliderRef = useRef<React.LegacyRef<Slider>>()
    const [ref, { width }] = useDimensions();

    const settings: Settings = {
        slidesToShow: width ? Math.floor((width) / (180 + 40)) : 1,
        slidesToScroll: 4,
        infinite: false,
        waitForAnimate: false,
        prevArrow: <Button><FontAwesomeIcon icon={faChevronLeft} /></Button>,
        nextArrow: <Button><FontAwesomeIcon icon={faChevronRight} /></Button>,
    };

    return (
        <div className={`path-container ${stateClass}`}>
            <Button onClick={() => setShow(prev => !prev)}>
                Níveis
                {" "}
                <FontAwesomeIcon icon={show ? faChevronDown : faChevronUp} />
            </Button>

            <div className="path-content">
                <div ref={ref}>
                    <Slider {...settings} ref={sliderRef.current}>
                        {levels.map(level => {
                            const data = userData.find(d => d.level_id === level.id);

                            let bestGuess = null;
                            if (data && data.guesses) {
                                bestGuess = data.guesses.sort((g1, g2) => g1.distance - g2.distance)[0];
                            }

                            return (
                                <Button
                                    key={level.id}
                                    className={`path-content-level full ${current === level.id && "current"}`}
                                    onClick={() => onLevelClick(level.id)}
                                >
                                    <span className={`level-number ${!bestGuess && "never-tried"}`}>{level.id}</span>

                                    {bestGuess && (
                                        <>
                                            <OpenStreetMapsData
                                                data={bestGuess.data as any}
                                                className="best-guess"
                                                distance={bestGuess.distance}
                                            >
                                                <span>Dicas: {bestGuess.hints_viewed}</span>
                                            </OpenStreetMapsData>
                                        </>
                                    )}
                                </Button>
                            );
                        })}
                    </Slider>
                </div>
            </div>
        </div>
    )
}

export default Path