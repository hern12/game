import Matrix from './Matrix';

export interface Tile {
  value: number;
  x: number;
  y: number;
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

  private moveRowToFront(tiles: Array<Tile | null>, getScore: (score: number) => void): Array<Tile | null> {
    const newTiles: Array<Tile | null> = [];
    let head = 0;
    let tail = tiles.length - 1;
    let prevValue = NaN;
    tiles.forEach(tile => {
      if (tile !== null) {
        if (prevValue === tile.value) {
          getScore(tile.value * 2);
          newTiles[head - 1] = { ...tile, value: tile.value * 2 };
          newTiles[tail--] = null;
          prevValue = NaN;
        } else {
          newTiles[head++] = { ...tile };
          prevValue = tile.value;
        }
      } else {
        newTiles[tail--] = null;
      }
    });
    return newTiles;
  }

  private moveRowToBack(row: Array<Tile | null>, getScore: (score: number) => void): Array<Tile | null> {
    return this.moveRowToFront([...row].reverse(), getScore).reverse();
  }
}
