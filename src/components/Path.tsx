import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import React, { useRef, useState } from "react"
import data from '../data.json';
import userData from '../user-data.json';
import Button from "./Button";
import "slick-carousel/slick/slick.css";
import useDimensions from "react-use-dimensions";
import Slider, { Settings } from "react-slick";


interface Props {
    levels: typeof data.levels
    userData: typeof userData
    current: number
    onLevelClick: (index: number) => void
}

const Path: React.FC<Props> = ({ levels, current, onLevelClick }) => {
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
                        {levels.map(level => (
                            <Button
                                key={level.id}
                                className="path-content-level full"
                                onClick={() => onLevelClick(level.id)}
                            >
                                {level.id} - {level.city.name}
                            </Button>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    )
}

export default Path