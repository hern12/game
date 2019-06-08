import { useCallback } from 'react';
import useCommittedRef from './useCommittedRef';

type Func = (...args: any[]) => any;

/** https://github.com/react-restart/hooks */
export default function useEventCallback<T extends Func>(fn?: T): T {
  const ref = useCommittedRef(fn);
  return useCallback((...args: any[]) => {
    return ref.current && ref.current(...args);
  }, [ref]) as any;
}
