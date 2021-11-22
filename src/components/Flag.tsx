import React from 'react';

interface FlagProps {
  name: string;
  code: string;
}

export default function Flag({ name, code }: FlagProps) {
  return (
    <img
      alt={name}
      height={20}
      width={30}
      src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${code}.svg`}
    />
  );
}
