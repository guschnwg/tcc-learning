import React from "react";
import Flag from "./Flag";

type OSMAddressKeys = (keyof OSMAddress)[]

export const DISTRICT_KEYS: OSMAddressKeys = ["city_district", "district", "borough", "suburb", "subdivision"];
export const CITY_KEYS: OSMAddressKeys = ["city", "town", "village", "municipality"];
export const STATE_KEYS: OSMAddressKeys = ["state", "state_district", "county"];

export function findItemInOSMData(address: OSMAddress, keys: OSMAddressKeys): string {
  for (const key of keys) {
    if (key in address) {
      return address[key] as string;
    }
  }
  return "";
}

function isSame(addressOne: OSMAddress, addressTwo: OSMAddress, keys: OSMAddressKeys): boolean {
  return findItemInOSMData(addressOne, keys) === findItemInOSMData(addressTwo, keys);
}

export function isSameOSMPlace(addressOne: OSMAddress, addressTwo: OSMAddress): boolean {
  if (!isSame(addressOne, addressTwo, STATE_KEYS)) {
    return false;
  }
  if (!isSame(addressOne, addressTwo, CITY_KEYS)) {
    return false;
  }
  if (!isSame(addressOne, addressTwo, ["region"])) {
    return false;
  }
  if (!isSame(addressOne, addressTwo, ["country"])) {
    return false;
  }

  return true;
}

const OpenStreetMapsData: React.FC<OpenStreetMapDataProps> = ({ data, className = "", distance, children }) => {
  const city = findItemInOSMData(data.address, CITY_KEYS);
  const state = findItemInOSMData(data.address, STATE_KEYS);

  return (
    <div className={`data-container ${className}`}>
      {city && <span>Cidade: {city}</span>}
      {state && <span>Estado: {state}</span>}
      {data.address.region && <span>Região: {data.address.region}</span>}
      {data.address.country && data.address.country_code && (
        <span className="country">
          País: {data.address.country}
          <Flag name={data.address.country} code={((data.address.country_code as string) || '').toUpperCase()} />
        </span>
      )}
      {distance && (<span>Distância: {(distance / 1000).toFixed(2)} km</span>)}
      {children}
    </div>
  );
}

export default OpenStreetMapsData;
