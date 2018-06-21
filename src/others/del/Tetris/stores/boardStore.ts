import { observable, action, computed } from 'mobx';

export type Board = {
  row?: number;
  col?: number;
  size?: number;
  gup?: number;
};

export class BoardStore {
  @observable row: number;
  @observable col: number;
  @observable size: number;
  @observable gup: number;

  constructor(board?: Board) {
    this.onReset(board);
  }

  @action onReset({ row = 20, col = 10, size = 36, gup = 3 }: Board = {}) {
    this.row = row;
    this.col = col;
    this.size = size;
    this.gup = gup;
  }

  @computed get length() {
    return this.size + this.gup;
  }

  @computed get width() {
    return this.length * this.col + this.gup;
  }

  @computed get height() {
    return this.length * this.row + this.gup;
  }
}

const boardStore = new BoardStore();

export default boardStore;
