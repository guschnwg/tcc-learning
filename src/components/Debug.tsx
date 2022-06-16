import React, { useEffect } from "react";
import supabase, { GAME_LEVELS_TABLE, GUESSES_TABLE, LEVELS_TABLE } from "../supabase";

async function update() {
  const { data, error } = await supabase
    .from(GUESSES_TABLE)
    .select(`*, ${GAME_LEVELS_TABLE}!guesses_game_level_id_fkey(*, ${LEVELS_TABLE}!inner(*))`);

  if (!data) {
    return;
  }

  debugger

  for (const item of data) {
    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(item),
      new google.maps.LatLng(item.game_levels.levels)
    );
    await supabase.from(GUESSES_TABLE).update({ distance }).match({ id: item.id })
  }

  console.log(data)
}

const Debug: React.FC = () => {
  useEffect(() => {
    // update();
  }, [])

  return null;
}

export default Debug;