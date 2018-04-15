import boardStore, { Board } from './boardStore';
import tileStore from './tileStore';

export { Board };

export type WithBoardStore = {
  boardStore?: typeof boardStore;
};

export type WithTileStore = {
  tileStore?: typeof tileStore;
}

const stores = {
  boardStore,
  tileStore,
};

export type WithStores = typeof stores;

export default stores;
