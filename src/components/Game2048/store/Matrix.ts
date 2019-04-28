interface Position {
  x: number;
  y: number;
}

export default class Matrix<T> {
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
