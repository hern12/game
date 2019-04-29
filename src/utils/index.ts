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
  }
};
