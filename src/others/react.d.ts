import * as React from 'react';

/** react@16.3.1 Context API */
declare module 'react' {
  interface Context<T> {
    Provider: React.ComponentType<{ value: T }>;
    Consumer: React.ComponentType<{ children: (value: T) => React.ReactNode }>;
  }

  function createContext<T>(defaultValue: T, calculateChangedBits?: (a: T, b: T) => number): Context<T>;
}
