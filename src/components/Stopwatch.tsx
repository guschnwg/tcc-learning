import React from 'react';
import { useStopwatch } from 'react-timer-hook';

export default function Stopwatch() {
  const { seconds, minutes, hours, days, isRunning, start, pause } = useStopwatch({ autoStart: true });

  return (
    <div>
      <div style={{ fontSize: '100px' }}>
        <span>{seconds + minutes * 60 + hours * 60 * 60 + days * 60 * 60 * 24}</span>
      </div>
      <p>{isRunning ? 'Running' : 'Not running'}</p>
      <button onClick={start}>Start</button>
      <button onClick={pause}>Pause</button>
      <button
        onClick={() => {
          // Restarts to 5 minutes timer
          const time = new Date();
          time.setSeconds(time.getSeconds() + 300);
        }}
      >
        Restart
      </button>
    </div>
  );
}
