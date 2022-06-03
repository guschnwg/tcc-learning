import React, { useEffect, useRef } from 'react';
import { useStopwatch } from 'react-timer-hook';

const total = (seconds: number, minutes: number, hours: number, days: number): number => seconds + minutes * 60 + hours * 60 * 60 + days * 60 * 60 * 24

interface Props {
  start?: number
  step?: number
  onChange?: (total: number) => void
  onStep?: (total: number) => void
}


const Stopwatch: React.FC<Props> = ({ start = 0, step = 10, children, onChange, onStep }) => {
  const { seconds, minutes, hours, days } = useStopwatch({
    autoStart: true,
    offsetTimestamp: new Date(Date.now() + start * 1000),
  });
  const lastStepEmitted = useRef<number>(start);

  useEffect(() => {
    const current = total(seconds, minutes, hours, days);

    if (onChange) {
      onChange(current)
    }
    if (onStep && current >= lastStepEmitted.current + step) {
      onStep(current)
      lastStepEmitted.current = current;
    }

  }, [onChange, seconds, minutes, hours, days, onStep, start, step])

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
