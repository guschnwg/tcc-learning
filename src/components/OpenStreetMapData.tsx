import React from "react";
import Flag from "./Flag";

const OpenStreetMapsData: React.FC<OpenStreetMapDataProps> = ({ data, className = "", distance, children }) => {
  const city = data.address.city || data.address.town || data.address.municipality || data.address.county || data.address.village;
  if (!city) {
    console.log(data);
  }

  const district = data.address.neighbourhood || data.address.suburb || data.address.city_district;

  return (
    <div className={`data-container ${className}`}>
      {district && <span>Bairro: {district}</span>}
      {city && <span>Cidade: {city}</span>}
      {data.address.state && <span>Estado: {data.address.state}</span>}
      {data.address.region && <span>Região: {data.address.region}</span>}
      {data.address.country && data.address.country_code && (
        <span className="country">
          País: {data.address.country}
          <Flag name={data.address.country} code={((data.address.country_code as string) || '').toUpperCase()} />
        </span>
      )}
      {distance && (<span>Distância: {distance} km</span>)}
      {children}
    </div>
  );
}

export default OpenStreetMapsData;
