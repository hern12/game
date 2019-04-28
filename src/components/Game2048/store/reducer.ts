import {
  LEFT,
  DOWN,
  RIGHT,
  UP,
  SET_BOARD_LENGTH,
  INITI,
  ActionTypes,
  InitialState,
  State,
  TileMove
} from './types';
import TileMatrix, { Tile } from './TileMatrix';

function getLeft(nowTileMatrix: TileMatrix): TileMove {
  const tileMatrix = new TileMatrix(nowTileMatrix.size, nowTileMatrix.tiles);
  let score = 0;
  tileMatrix.moveToFront(_score => score += _score);
  return {
    isRemovable: !nowTileMatrix.isEqual(tileMatrix),
    score,
    tiles: tileMatrix.tiles,
  };
}

function getDown(nowTileMatrix: TileMatrix): TileMove {
  const tileMatrix = new TileMatrix(nowTileMatrix.size, nowTileMatrix.tiles);
  let score = 0;
  tileMatrix.transposeMatrix();
  tileMatrix.moveToBack(_score => score += _score);
  tileMatrix.transposeMatrix();
  return {
    isRemovable: !nowTileMatrix.isEqual(tileMatrix),
    score,
    tiles: tileMatrix.tiles,
  };
}

function getRight(nowTileMatrix: TileMatrix): TileMove {
  const tileMatrix = new TileMatrix(nowTileMatrix.size, nowTileMatrix.tiles);
  let score = 0;
  tileMatrix.moveToBack(_score => score += _score);
  return {
    isRemovable: !nowTileMatrix.isEqual(tileMatrix),
    score,
    tiles: tileMatrix.tiles,
  };
}

function getUp(nowTileMatrix: TileMatrix): TileMove {
  const tileMatrix = new TileMatrix(nowTileMatrix.size, nowTileMatrix.tiles);
  let score = 0;
  tileMatrix.transposeMatrix();
  tileMatrix.moveToFront(_score => score += _score);
  tileMatrix.transposeMatrix();
  return {
    isRemovable: !nowTileMatrix.isEqual(tileMatrix),
    score,
    tiles: tileMatrix.tiles,
  };
}

function getGameover(tileMatrix: TileMatrix, left: TileMove, down: TileMove, right: TileMove, up: TileMove): boolean {
  const existEmpty = tileMatrix.value.some((eachRow) => eachRow.some((eachValue) => eachValue === null));
  return !(existEmpty || left.isRemovable || down.isRemovable || right.isRemovable || up.isRemovable);
}

function computeMove(size: number, tiles: Tile[], addCount = 1) {
  const tileMatrix = new TileMatrix(size, tiles);
  while (addCount-- > 0) tileMatrix.addTile();
  const left = getLeft(tileMatrix);
  const down = getDown(tileMatrix);
  const right = getRight(tileMatrix);
  const up = getUp(tileMatrix);
  const gameover = getGameover(tileMatrix, left, down, right, up);
  return {
    tiles: tileMatrix.tiles,
    left,
    down,
    right,
    up,
    gameover
  };
}

function getCellLength(boardLength: number, size: number, gup: number) {
  return (boardLength - (size + 1) * gup) / size;
}

export function initState({ size, gup, boardLength, score, best, tiles }: InitialState): State {
  const computed = computeMove(size, tiles, tiles.length > 0 ? 0 : 2);
  return {
    size,
    gup,
    boardLength,
    score,
    best,
    cellLength: getCellLength(boardLength, size, gup),
    ...computed,
  };
}

export function reducer(state: State, action: ActionTypes): State {
  switch (action.type) {
    case LEFT:
      if (state.left.isRemovable) {
        const computed = computeMove(state.size, state.left.tiles);
        const score = state.score + state.left.score;
        const best = score < state.best ? state.best : score;
        return {
          ...state,
          ...computed,
          score,
          best,
        };
      }
      return state;
    case DOWN:
      if (state.down.isRemovable) {
        const computed = computeMove(state.size, state.down.tiles)
        const score = state.score + state.down.score;
        const best = score < state.best ? state.best : score;
        return {
          ...state,
          ...computed,
          score,
          best,
        };
      }
      return state;
    case RIGHT:
      if (state.right.isRemovable) {
        const computed = computeMove(state.size, state.right.tiles)
        const score = state.score + state.right.score;
        const best = score < state.best ? state.best : score;
        return {
          ...state,
          ...computed,
          score,
          best,
        };
      }
      return state;
    case UP:
      if (state.up.isRemovable) {
        const computed = computeMove(state.size, state.up.tiles)
        const score = state.score + state.up.score;
        const best = score < state.best ? state.best : score;
        return {
          ...state,
          ...computed,
          score,
          best,
        };
      }
      return state;
    case SET_BOARD_LENGTH:
      const boardLength = action.boardLength;
      return {
        ...state,
        boardLength,
        cellLength: getCellLength(boardLength, state.size, state.gup),
      };
    case INITI:
      return initState(action.initialState);
    default:
      return state;
  }
}