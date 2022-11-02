import React, { useEffect } from "react";

interface Props {
  guesses?: GuessEntity[]
  coordinates?: google.maps.LatLngLiteral
}

const Carousel: React.FC<Props> = ({ coordinates }) => {
  useEffect(() => {
    console.log("oi")
  }, [coordinates])


  return null;
}

export default Carousel;