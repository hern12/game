import Matrix from './Matrix';

export interface Tile {
  x: number;
  y: number;
  value: number;
}

export default class TileMatrix extends Matrix<Tile | null> {
  constructor(size: number, tiles: Tile[] = []) {
    super(size);
    tiles.forEach(tile => {
      this.value[tile.y][tile.x] = tile;
    });
  }

  get tiles(): Tile[] {
    const result: Tile[] = [];
    this.value.forEach((eachRow, row) => eachRow.forEach((eachValue, col) => {
      if (eachValue !== null) result[result.length] = { ...eachValue, y: row, x: col };
    }));
    return result;
  }

  addTile(): boolean {
    const emptyPositions = this.emptyPositions;
    const length = emptyPositions.length;
    if (!length) return false;
    const emptyPosition = emptyPositions[Math.random() * length | 0];
    const { row, col } = emptyPosition;
    this.value[row][col] = { y: row, x: col, value: Math.random() > 0.1 ? 2 : 4 };
    return true;
  }

  isEqual(tileMatrix: TileMatrix): boolean {
    return super.isEqual(tileMatrix, (own, its) => {
      if (own !== null && its !== null) return own.value !== its.value;
      else return true;
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
