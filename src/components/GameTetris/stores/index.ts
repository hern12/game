import boardStore, { Board } from './boardStore';
import quadrelStore, { QuadrelCode, Quadrel } from './quadrelStore';
import heapStore from './heapStore';

export { Board, QuadrelCode, Quadrel };

export type WithBoardStore = {
  boardStore?: typeof boardStore;
};

export type WithQuadrelStore = {
  quadrelStore?: typeof quadrelStore;
};

export type WithHeapStore = {
  heapStore?: typeof heapStore;
}

const stores = {
  boardStore,
  quadrelStore,
  heapStore
};

export type WithStores = typeof stores;

export default stores;
