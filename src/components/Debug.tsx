/* eslint-disable */

import React, { useEffect, useState } from "react";
import supabase, { HINTS_TABLE, LEVELS_TABLE, MODES_TABLE, MODE_LEVELS_TABLE } from "../supabase";
import { cityName } from "./OpenStreetMapData";

const Level = ({ level, refresh }: any) => {
  return <details>
    <summary>{cityName(level.data.address)}</summary>

    <div>
      <h2>Dicas</h2>

      <div>
        {(level.hints || []).map((h: any) => (
          <details key={h.id}>
            <summary>{h.description}</summary>

            <ul>
              {h.links.map((link: any) => (
                <li>
                  {link.description} {link.url}
                  <button onClick={async () => {
                    await supabase.from(HINTS_TABLE).update({ links: h.links.filter((l: any) => l.url !== link.url) }).match({ level_id: level.id })
                    refresh()
                  }}>X</button>
                </li>
              ))}
            </ul>

            <button onClick={async () => {
              const url = prompt("url");
              const description = prompt("Descrição");
              if (url) {
                await supabase.from(HINTS_TABLE).update({ links: [...h.links, { url, description }] }).match({ level_id: level.id, id: h.id })
                refresh()
              }
            }}>Add link</button>
          </details>
        ))}

        <button onClick={async () => {
          const hint = prompt("hint");
          if (hint) {
            await supabase.from(HINTS_TABLE).insert({
              level_id: level.id,
              description: hint,
            })
            refresh();
          }
        }}>Add Hint</button>
      </div>
    </div>
  </details>
}

const AddLevelToMode = ({ levels, mode, refresh }: any) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);

  return (
    <div>
      <button onClick={() => setOpen(true)}>+ Nível</button>

      <dialog open={open}>
        <select onChange={e => setSelected(Number(e.target.value))}>
          {levels.map((l: any) => <option value={l.id}>{l.id} {cityName(l.data.address)}</option>)}
        </select>

        <button onClick={async ev => {
          if (!selected) {
            return
          }
          await supabase.from(MODE_LEVELS_TABLE).insert({ mode_id: mode.id, level_id: selected });

          setOpen(false);

          refresh();
        }}>Adicionar</button>
      </dialog>
    </div>
  )
}

const Debug: React.FC = () => {
  const [modes, setModes] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);

  const load = () => {
    supabase.from(MODES_TABLE).select(`*, ${MODE_LEVELS_TABLE}!left(*, ${LEVELS_TABLE}!left(*, ${HINTS_TABLE}!left(*))))`).then(({ data }) => {
      setModes(data || []);
    });

    supabase.from(LEVELS_TABLE).select(`*, ${HINTS_TABLE}!left(*)`).then(({ data }) => {
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
          <summary>
            {d.title}

            <input type='checkbox' checked={d.active} onClick={async () => {

              await supabase.from(MODES_TABLE).update({ active: !d.active }).match({ id: d.id })
              load()
            }} />
          </summary>

          {d.mode_levels.map((ml: any) => ml.levels).map((l: any) => <Level id={l.id} level={l} refresh={load} />)}

          <AddLevelToMode levels={levels} mode={d} refresh={load} />
        </details>
      ))}

      <button
        onClick={async () => {
          const title = prompt("nome");
          if (title) {
            await supabase.from(MODES_TABLE).insert({ title, active: false })
            load();
          }
        }}
      >
        Criar modo de jogo
      </button>


      <h4>Níveis</h4>

      {levels.map(l => <Level id={l.id} level={l} refresh={load} />)}
    </>
  );
}

export default Debug;