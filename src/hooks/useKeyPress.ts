import { useState, useEffect } from 'react'

export default function useKeyPress(targetKey: string) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = ({ key }: KeyboardEvent) =>
      key === targetKey && setKeyPressed(true);
    const handleKeyUp = ({ key }: KeyboardEvent) =>
      key === targetKey && setKeyPressed(false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  }, []);
  
  return keyPressed;
}
