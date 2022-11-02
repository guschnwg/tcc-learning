import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useEffect } from "react";

import Button from './Button';
import Modal from './Modal';

interface HintsProps {
  currentTimeRef: React.MutableRefObject<number>
  hints: HintEntity[]
  hintsViewed: GameLevelHintEntity[]
  show: boolean
  onHide: () => void
  onHintView: (hint: HintEntity) => void
}

const HintLinks: React.FC<{ hint: HintEntity }> = ({ hint }) => {
  if (!hint.links) {
    return null;
  }

  return (
    <ul style={{ margin: "10px 0" }}>
      {hint.links.map(link => (
        <li key={link.description} style={{ margin: "5px 0" }}>
          {link.description}
          <Button className="small" onClick={() => window.open(link.url, 'hintlink', 'height=600,width=900')?.focus()}>
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Button>
        </li>
      ))}
    </ul>
  );
}

const Hints: React.FC<HintsProps> = ({ currentTimeRef, hints, hintsViewed, show, onHide, onHintView }) => {
  const [waitForToView, setWaitForToView] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const views = hints.map(h => hintsViewed.find(hv => hv.hint_id === h.id && hv.time_elapsed))
        .filter((hv): hv is GameLevelHintEntity => Boolean(hv))
        .map(hv => hv.time_elapsed)
        .sort()
        .reverse();

      if (views) {
        const lastViewedAt = views[0];
        if (currentTimeRef.current - lastViewedAt < 30) {
          setWaitForToView(30 - (currentTimeRef.current - lastViewedAt));
          return;
        }
      }

      setWaitForToView(0);
    }, 250);

    return () => clearInterval(interval);
  }, [hints, hintsViewed, currentTimeRef]);

  return (
    <Modal show={show} onHide={onHide}>
      <h2>Dicas</h2>

      <ol className="hints">
        {hints.map((hint) => {
          const hintView = hintsViewed.find(h => h.hint_id === hint.id);
          if (hintView) {
            return (
              <li key={hint.id}>
                <span>
                  {hint.description} - <small>Visto aos {hintView.time_elapsed}s</small>
                </span>
                <HintLinks hint={hint} />
              </li>
            );
          }

          return (
            <li key={hint.id}>
              <Button
                className="small"
                onClick={() => {
                  if (!waitForToView) {
                    setWaitForToView(30);
                    onHintView(hint)
                  }
                }}
                disabled={!!waitForToView}
              >
                {waitForToView ? `Espere ${waitForToView}s` : "Mostrar"}
              </Button>
            </li>
          );
        })}
      </ol>
    </Modal>
  );
};

export default Hints;
