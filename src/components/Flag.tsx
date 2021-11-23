import React from 'react';

interface Props {
  name: string;
  code: string;
}

const Flag: React.FC<Props> = ({ name, code }) => {
  return (
    <img
      alt={name}
      height={20}
      width={30}
      src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
    />
  );
};

export default Flag;
