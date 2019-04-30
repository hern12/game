export type Action<T> = [T[], (e: KeyboardEvent) => void];

export const utils = {
  handleKey<K extends keyof KeyboardEvent = 'keyCode'>(e: KeyboardEvent, actions: Array<Action<KeyboardEvent[K]>>, key: K = 'keyCode' as any) {
    const keyValue = e[key];
    let keys, handler;
    for (let i = 0, length = actions.length; i < length; i++) {
      [keys, handler] = actions[i];
      if (keys.includes(keyValue)) {
        handler(e);
        e.preventDefault();
        return;
      }
    }
  },
  save(key: string, value: any) {
    if (!window.localStorage) return false;
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  },
  load<T = any>(key: string): false | T {
    if (!window.localStorage) return false;
    return JSON.parse(window.localStorage.getItem(key)!);
  }
};
