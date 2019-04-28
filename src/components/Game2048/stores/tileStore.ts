import { observable, action, computed } from 'mobx';
import boardStore from './boardStore';
interface Position {
  x: number;
  y: number;
}

class Matrix<T> {
  value: T[][];
  size: number;

  constructor(size: number)
  constructor(likeMatrix: T[][])
  constructor(arg: number | T[][]) {
    const argIsN = typeof arg === 'number';
    const size = argIsN ? (arg as number) : (arg as T[][]).length;
    this.size = size;
    this.value = [];
    for (let y = 0; y < size; y++) {
      const cols: T[] = [];
      for (let x = 0; x < size; x++) {
        cols[x] = argIsN ? null : arg[y][x];
      }
      this.value[y] = cols;
    }
  }

  get emptyPositions(): Position[] {
    const positions: Position[] = [];
    this.value.forEach((eachRow, y) => eachRow.forEach((eachValue, x) => {
      if (eachValue === null) positions[positions.length] = { y, x };
    }));
    return positions;
  }

  transposeMatrix(): void {
    const origin = new Matrix<T>(this.value);
    this.value.forEach((eachRow, row) => eachRow.forEach((eachValue, column) => {
      this.value[column][row] = origin.value[row][column];
    }));
  }

  isEqual(matrix: Matrix<T>, assert = (own: T, its: T) => own !== its): boolean {
    const size = matrix.size;
    if (this.size !== size) return false;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (assert(this.value[y][x], matrix.value[y][x])) return false;
      }
    }
    return true;
  }
}

export interface Tile {
  x: number;
  y: number;
  value: number;
}

class TileMatrix extends Matrix<Tile | null> {
  constructor(size: number, tiles: Tile[] = []) {
    super(size);
    tiles.forEach(tile => {
      this.value[tile.y][tile.x] = tile;
    });
  }

  get tiles(): Tile[] {
    const result: Tile[] = [];
    this.value.forEach((eachRow, y) => eachRow.forEach((eachValue, x) => {
      if (eachValue !== null) result[result.length] = { ...eachValue, y, x };
    }));
    return result;
  }

  addTile(): boolean {
    const emptyPositions = this.emptyPositions;
    const length = emptyPositions.length;
    if (!length) return false;
    const emptyPosition = emptyPositions[Math.random() * length | 0];
    const { x, y } = emptyPosition;
    this.value[y][x] = { y, x, value: Math.random() > 0.1 ? 2 : 4 };
    return true;
  }

  isEqual(tileMatrix: TileMatrix): boolean {
    return super.isEqual(tileMatrix, (own, its) => {
      if (own !== null && its !== null) return own.value !== its.value;
      return own !== its;
    });
  }

  moveToFront(getScore: (score: number) => void): void {
    this.value.forEach((eachRow, y) => {
      this.value[y] = this.moveRowToFront(eachRow, getScore);
    });
  }

  moveToBack(getScore: (score: number) => void): void {
    this.value.forEach((eachRow, y) => {
      this.value[y] = this.moveRowToBack(eachRow, getScore);
    });
  }

  private moveRowToFront(row: Array<Tile | null>, getScore: (score: number) => void): Array<Tile | null> {
    const newRow: Array<Tile | null> = [];
    const length = row.length;
    let head = 0;
    let tail = length - 1;
    let prevValue = NaN;
    row.forEach(eachValue => {
      if (eachValue !== null) {
        if (prevValue === eachValue.value) {
          getScore(eachValue.value * 2);
          newRow[head - 1] = { ...eachValue, value: eachValue.value * 2 };
          newRow[tail--] = null;
          prevValue = NaN;
        } else {
          newRow[head++] = { ...eachValue };
          prevValue = eachValue.value;
        }
      } else {
        newRow[tail--] = null;
      }
    });
    return newRow;
  }

  private moveRowToBack(row: Array<Tile | null>, getScore: (score: number) => void): Array<Tile | null> {
    return this.moveRowToFront([...row].reverse(), getScore).reverse();
  }
}

export type TileMove = {
  tileMatrix: TileMatrix;
  isRemovable: boolean;
  score: number;
  direction: MoveDirection;
};

interface Move {
  up: TileMove;
  down: TileMove;
  left: TileMove;
  right: TileMove;
}

export type MoveDirection = keyof Move;

export type MatrixStoreRestartOptions = {
  initCount?: number;
  score?: number;
  bestScore?: number;
};

class TileStore implements Move {
  @observable tileMatrix: TileMatrix;
  @observable score = 0;
  @observable bestScore = 0;
  @observable gameover = false;

  boardStore: typeof boardStore;

  constructor(options: MatrixStoreRestartOptions = {}) {
    this.boardStore = boardStore;
    this.onRestart(options);
  }

  @action onRestart({ initCount = 2, score = 0, bestScore = this.bestScore }: MatrixStoreRestartOptions = {}) {
    const tileMatrix = new TileMatrix(this.size);
    while (initCount-- > 0) {
      if (!tileMatrix.addTile()) break;
    }
    this.tileMatrix = tileMatrix;
    this.score = score;
    this.bestScore = bestScore;
    this.gameover = false;
  }

  @action onMove({ tileMatrix, isRemovable, score }: TileMove) {
    if (isRemovable) {
      this.tileMatrix = tileMatrix;
      this.score += score;
      this.bestScore = Math.max(this.score, this.bestScore);
      this.addValue();
      this.gameover = this.getGameover();
    }
  }

  @action.bound addValue() {
    if (!this.gameover) this.tileMatrix.addTile();
  }

  @computed get tiles(): Tile[] {
    return this.tileMatrix.tiles;
  }

  @computed get up(): TileMove {
    const tileMatrix = new TileMatrix(this.size, this.tiles);
    tileMatrix.transposeMatrix();
    let sumScore = 0;
    tileMatrix.moveToFront((score) => { sumScore += score; });
    tileMatrix.transposeMatrix();
    return {
      tileMatrix,
      isRemovable: !this.tileMatrix.isEqual(tileMatrix),
      score: sumScore,
      direction: 'up',
    };
  }

  @computed get down(): TileMove {
    const tileMatrix = new TileMatrix(this.size, this.tiles);
    tileMatrix.transposeMatrix();
    let sumScore = 0;
    tileMatrix.moveToBack((score) => { sumScore += score; });
    tileMatrix.transposeMatrix();
    return {
      tileMatrix,
      isRemovable: !this.tileMatrix.isEqual(tileMatrix),
      score: sumScore,
      direction: 'down',
    };
  }

  @computed get left(): TileMove {
    const tileMatrix = new TileMatrix(this.size, this.tiles);
    let sumScore = 0;
    tileMatrix.moveToFront((score) => { sumScore += score; });
    return {
      tileMatrix,
      isRemovable: !this.tileMatrix.isEqual(tileMatrix),
      score: sumScore,
      direction: 'left',
    };
  }

  @computed get right(): TileMove {
    const tileMatrix = new TileMatrix(this.size, this.tiles);
    let sumScore = 0;
    tileMatrix.moveToBack((score) => { sumScore += score; });
    return {
      tileMatrix,
      isRemovable: !this.tileMatrix.isEqual(tileMatrix),
      score: sumScore,
      direction: 'right',
    };
  }

  get size() {
    return Math.max(this.boardStore.row, this.boardStore.col)
  }

  getGameover() {
    const existEmpty = this.tileMatrix.value.some((eachRow) => eachRow.some((eachValue) => eachValue === null));
    return !(existEmpty || this.up.isRemovable || this.down.isRemovable || this.left.isRemovable || this.right.isRemovable);
  }
}

export default new TileStore();
