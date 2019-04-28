import { useState, useEffect } from 'react'
import { easing, EasingNames } from '../easing';

function useAnimationTimer(duration: number, delay: number) {
  const [elapsed, setTime] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let timerStop: number;
    let start: number;

    function onFrame() {
      setTime(Date.now() - start);
      loop();
    }

    function loop() {
      animationFrame = window.requestAnimationFrame(onFrame);
    }

    function onStart() {
      timerStop = window.setTimeout(() => {
        window.cancelAnimationFrame(animationFrame);
        setTime(Date.now() - start);
      }, duration);
      start = Date.now();
      loop();
    }

    const timerDelay = window.setTimeout(onStart, delay);

    return () => {
      window.clearTimeout(timerStop);
      window.clearTimeout(timerDelay);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [duration, delay]);

  return elapsed;
}

export default function useAnimation(easingName: EasingNames = 'linear', duration = 500, delay = 0) {
  const elapsed = useAnimationTimer(duration, delay);
  const t = Math.min(1, elapsed / duration);

  return easing[easingName](t);
}
