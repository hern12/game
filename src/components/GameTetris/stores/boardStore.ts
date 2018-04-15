import { observable, action, computed } from 'mobx';

export type Board = {
  row?: number;
  col?: number;
  size?: number;
  gup?: number;
};

class BoardStore {
  @observable row = 20;
  @observable col = 10;
  @observable size = 36;
  @observable gup = 4;

  constructor(board?: Board) {
    this.onReset(board);
  }

  @action onReset({ row = 20, col = 10, size = 36, gup = 4 }: Board = {}) {
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
