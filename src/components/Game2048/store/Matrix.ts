interface Position {
  row: number;
  col: number;
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
    for (let row = 0; row < size; row++) {
      const cols: T[] = [];
      for (let col = 0; col < size; col++) {
        cols[col] = argIsN ? null : arg[row][col];
      }
      this.value[row] = cols;
    }
  }

  get emptyPositions(): Position[] {
    const positions: Position[] = [];
    this.value.forEach((eachRow, row) => eachRow.forEach((eachValue, col) => {
      if (eachValue === null) positions[positions.length] = { row, col };
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
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (assert(this.value[row][col], matrix.value[row][col])) return false;
      }
    }
    return true;
  }
}
