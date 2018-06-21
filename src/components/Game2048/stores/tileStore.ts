import { observable, action, computed } from 'mobx';
import boardStore from './boardStore';

export type Position = {
  row: number;
  col: number;
};

class Matrix<T> {
  value: T[][];

  readonly size: number;

  constructor(size: number) {
    const value: T[][] = [];
    let i = size;
    while (i-- > 0) {
      value.push(Array(size).fill(null));
    }
    this.value = value;
    this.size = size;
  }

  get emptyPositions(): Position[] {
    const positions: Position[] = [];
    this.value.forEach((eachRow, row) => {
      eachRow.forEach((eachValue, col) => {
        if (eachValue === null) {
          positions.push({ row, col });
        }
      });
    });
    return positions;
  }

  transposeMatrix(): void {
    const value = new Matrix<T>(this.size).value;
    this.value.forEach((eachRow, row) => eachRow.forEach((eachValue, column) => {
      value[column][row] = this.value[row][column];
    }));
    this.value = value;
  }

  isEqual(matrix: Matrix<T>, assert = (own: T, its: T) => own !== its): boolean {
    try {
      const { size, value } = matrix;
      if (this.size !== size) {
        return false;
      }
      for (let row = 0; row < size; row++) {
        for (let column = 0; column < size; column++) {
          if (assert(this.value[row][column], value[row][column])) {
            return false;
          }
        }
      }
    } catch (e) {
      return false;
    }
    return true;
  }
}

export type Tile = {
  value: number;
  row: number;
  col: number;
};

class TileMatrix extends Matrix<Tile | null> {

  constructor(size: number, tiles: Tile[] = []) {
    super(size);
    tiles.forEach((tile) => {
      this.value[tile.row][tile.col] = tile;
    });
  }

  get tiles(): Tile[] {
    const tiles: Tile[] = [];
    this.value.forEach((eachRow, row) => eachRow.forEach((eachValue, col) => {
      if (eachValue !== null) {
        tiles.push({ ...eachValue, row, col });
      }
    }));
    return tiles;
  }

  addTile(): boolean {
    const emptyPositions = this.emptyPositions;
    const length = emptyPositions.length;
    if (!length) {
      return false;
    }
    const emptyPosition = emptyPositions[Math.random() * length | 0];
    const { row, col } = emptyPosition;
    this.value[row][col] = {
      value: Math.random() > 0.5 ? 2 : 4,
      row,
      col,
    };
    return true;
  }

  isEqual(tileMatrix: TileMatrix): boolean {
    return super.isEqual(tileMatrix, (own, its) => {
      if (own !== null && its !== null) {
        return own.value !== its.value;
      } else {
        return own !== its;
      }
    });
  }

  moveToFront(getScore: (score: number) => void): void {
    this.value.forEach((eachRow, row) => {
      this.value[row] = this.moveRowToFront(eachRow, getScore);
    });
  }

  moveToBack(getScore: (score: number) => void): void {
    this.value.forEach((eachRow, row) => {
      this.value[row] = this.moveRowToBack(eachRow, getScore);
    });
  }

  private moveRowToFront(row: Array<Tile | null>, getScore: (score: number) => void): Array<Tile | null> {
    const newRow: Array<Tile | null> = [];
    const length = row.length;
    let head = 0;
    let tail = length - 1;
    let prevValue = NaN;
    row.forEach((eachValue, index) => {
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
      if (!tileMatrix.addTile()) {
        break;
      }
    }
    this.tileMatrix = tileMatrix;
    this.score = score;
    this.bestScore = bestScore;
    this.gameover = false;
  }

  @action onMove({ tileMatrix, isRemovable, direction, score }: TileMove) {
    if (isRemovable) {
      this.tileMatrix = tileMatrix;
      this.score += score;
      this.bestScore = Math.max(this.score, this.bestScore);
      this.addValue();
      this.gameover = this.getGameover();
    }
  }

  @action.bound addValue() {
    if (!this.gameover) {
      this.tileMatrix.addTile();
    }
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
