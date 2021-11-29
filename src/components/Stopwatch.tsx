import React, { useEffect } from 'react';
import { useStopwatch } from 'react-timer-hook';

const total = (seconds: number, minutes: number, hours: number, days: number): number => seconds + minutes * 60 + hours * 60 * 60 + days * 60 * 60 * 24

interface Props {
  onChange?: (total: number) => void
}

const Stopwatch: React.FC<Props> = ({ children, onChange }) => {
  const { seconds, minutes, hours, days } = useStopwatch({ autoStart: true });

  useEffect(() => {
    if (onChange) {
      onChange(total(seconds, minutes, hours, days))
    }
  }, [onChange, seconds, minutes, hours, days])

  return (
    <div className="stopwatch">
      <div className="stopwatch-time shaking">⏰</div>
      <span className="stopwatch-time">
        {total(seconds, minutes, hours, days)}

        {children}
      </span>
    </div>
  );
};

export default Stopwatch;
