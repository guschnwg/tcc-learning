/* eslint-disable */

import React, { useEffect, useState } from "react";
import supabase, { HINTS_TABLE, LEVELS_TABLE, MODES_TABLE, MODE_LEVELS_TABLE } from "../supabase";
import { cityName } from "./OpenStreetMapData";

const Debug: React.FC = () => {
  const [modes, setModes] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  const load = () => {
    supabase.from(MODES_TABLE).select(`*, ${MODE_LEVELS_TABLE}!inner(*, ${LEVELS_TABLE}!inner(*)))`).then(({ data }) => {
      setModes(data || []);
    });

    supabase.from(LEVELS_TABLE).select(`*, ${HINTS_TABLE}!inner(*)`).then(({ data }) => {
      setLevels(data || []);
    });
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <div id="placeholder" />

      <h4>Modos</h4>

      {modes.map(d => (
        <details key={d.id}>
          <summary>{d.title}</summary>

          {d.mode_levels.map((ml: any) => ml.levels).map((l: any) => (
            <details key={l.id}>
              <summary>{cityName(l.data.address)}</summary>
              <pre>
                {JSON.stringify(l, null, 2)}
              </pre>
            </details>
          ))}
        </details>
      ))}


      <h4>Níveis</h4>

      {levels.map(l => (
        <details key={l.id}>
          <summary>{cityName(l.data.address)}</summary>

          <div>
            <h2>Dicas</h2>

            <div>
              {l.hints.map((h: any) => (
                <details key={h.id}>
                  <summary>{h.description}</summary>

                  <ul>
                    {h.links.map((link: any) => (
                      <li>
                        {link.description} {link.url}
                        <button onClick={async () => {
                          await supabase.from(HINTS_TABLE).update({ links: h.links.filter((l: any) => l.url !== link.url) }).match({ level_id: l.id })
                          load()
                        }}>X</button>
                      </li>
                    ))}
                  </ul>

                  <button onClick={async () => {
                    const url = prompt("url");
                    const description = prompt("Descrição");
                    if (url) {
                      await supabase.from(HINTS_TABLE).update({ links: [...h.links, { url, description }] }).match({ level_id: l.id, id: h.id })
                      load()
                    }
                  }}>Add link</button>
                </details>
              ))}

              <button onClick={async () => {
                const hint = prompt("hint");
                if (hint) {
                  await supabase.from(HINTS_TABLE).insert({
                    level_id: l.id,
                    description: hint,
                  })
                  load();
                }
              }}>Add Hint</button>
            </div>
          </div>
        </details>
      ))}
    </>
  );
}

export default Debug;