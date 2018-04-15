import { observable, action } from 'mobx';
import { Quadrel } from './quadrelStore';
import boardStore from './boardStore';

class HeapStore {
  @observable heap: Quadrel[];
  @observable score: number;
  @observable gameover: boolean;

  readonly boardStore: typeof boardStore;

  constructor(heap: Quadrel[] = []) {
    this.boardStore = boardStore;
    this.onRestart(heap);
  }

  @action onRestart(heap: Quadrel[] = []) {
    this.heap = heap;
    this.score = 0;
    this.gameover = false;
  }

  @action onAddQuadrels(quadrels: Quadrel[]) {
    let heap = this.heap.concat(quadrels);
    if (heap.some(({ point }) => point.y < 0)) {
      this.heap = heap;
      this.gameover = true;
      this.score += 10;
      return false;
    }
    let rows = quadrels.map(quadrel => quadrel.point.y).filter((y, idx, arr) => arr.indexOf(y) === idx);
    rows = rows.filter(row => heap.filter(quadrel => quadrel.point.y === row).length >= boardStore.col);
    if (rows.length > 0) {
      let counter = 0;
      rows.sort((a, b) => a - b).forEach(row => {
        heap = heap.map(quadrel => {
          if (quadrel !== null) {
            const { point: { x, y }, color } = quadrel;
            if (y < row && y >= counter) {
              return { point: { x, y: y + 1 },  color}
            } else if (y === row) {
              return { point: { x, y }, color: '' }
            }
          }
          return quadrel;
        });
        counter++;
      });
      heap = heap.filter(quadrel => quadrel.color !== '');
      const chain = rows.length;
      let score = 0;
      switch (chain) {
        case 3:
          score = 400;
          break;
        case 4:
          score = 800;
          break;
        default:
          score = chain * 100;
      }
      this.heap = heap;
      this.score += score + 10;
    } else {
      this.heap = heap;
      this.score += 10;
    }
    return true;
  }
}


const heapStore = new HeapStore();

export default heapStore;
