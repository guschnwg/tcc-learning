import React from 'react';
import { useStopwatch } from 'react-timer-hook';

const Stopwatch: React.FC = () => {
  const { seconds, minutes, hours, days, isRunning, start, pause } = useStopwatch({ autoStart: true });

  return (
    <div className="stopwatch">
      <div className="clock shaking">⏰</div>
      <span>{seconds + minutes * 60 + hours * 60 * 60 + days * 60 * 60 * 24}</span>
    </div>
  );
};

export default Stopwatch;
