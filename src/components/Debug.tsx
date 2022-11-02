/* eslint-disable */

import React, { useEffect, useState } from "react";
import supabase, { GAME_LEVELS_TABLE, GUESSES_TABLE, LEVELS_TABLE } from "../supabase";

async function update() {
  const { data } = await supabase.from(LEVELS_TABLE).select();
  if (!data) return;

  const urls: any = {};

  for (let level of data) {
    const center = new google.maps.LatLng(level.lat, level.lng);
    const map = new google.maps.Map(
      document.getElementById('placeholder')!,
      { center, zoom: 15 }
    );
    const request = { location: center, radius: 500 };

    const service = new google.maps.places.PlacesService(map);

    const placeId: string = await new Promise(resolve => {
      service.nearbySearch(request, (res, status) => resolve(res && res[0] && res[0].place_id || ""));
    })

    console.log(level.id, placeId);

    const photos: any[] = await new Promise(resolve => service.getDetails({ placeId }, res => resolve(res && res.photos || [])));

    console.log(level.id, photos);

    urls[level.id] = photos.map(p => p.getUrl());
  }

  return urls;
}

const Debug: React.FC = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    update().then(setData);
  }, [])

  return (
    <>
      <div id="placeholder" />

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </>
  );
}

export default Debug;