import { useRef, useEffect } from "react";

export default function useEventListener(type: string, listener: (e: Event) => void, eventTarget: EventTarget = window) {
  const savedHandler = useRef<(e: Event) => void>();

  useEffect(() => {
    savedHandler.current = listener;
  }, [listener]);
  
  useEffect(() => {
    const eventListener = (e: Event) => savedHandler.current!(e);
    eventTarget.addEventListener(type, eventListener);
    return () => {
      eventTarget.removeEventListener(type, eventListener);
    };
  }, [type, eventTarget]);
};
