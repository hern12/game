import {
  ADD_TILE,
  LEFT,
  DOWN,
  RIGHT,
  UP,
  SET_BOARD_LENGTH,
  INITI,
  UNDO,
  ActionTypes,
  InitialState,
  State,
  TileMove
} from './types';
import TileMatrix from './TileMatrix';
import { utils } from 'utils';

export const LOCAL_STORAGE_KEY = 'GAME2048';
const HISTORY_LIMIT = 10;

function getLeft(nowTileMatrix: TileMatrix): TileMove {
  const tileMatrix = new TileMatrix(nowTileMatrix.size, nowTileMatrix.tiles);
  let score = 0;
  tileMatrix.moveToFront(_score => score += _score);
  return {
    isRemovable: !nowTileMatrix.isEqual(tileMatrix),
    score,
    tileMatrix,
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
    tileMatrix,
  };
}

function getRight(nowTileMatrix: TileMatrix): TileMove {
  const tileMatrix = new TileMatrix(nowTileMatrix.size, nowTileMatrix.tiles);
  let score = 0;
  tileMatrix.moveToBack(_score => score += _score);
  return {
    isRemovable: !nowTileMatrix.isEqual(tileMatrix),
    score,
    tileMatrix,
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
    tileMatrix,
  };
}

function getGameover(tileMatrix: TileMatrix, left: TileMove, down: TileMove, right: TileMove, up: TileMove): boolean {
  const existEmpty = tileMatrix.value.some((eachRow) => eachRow.some((eachValue) => eachValue === null));
  return !(existEmpty || left.isRemovable || down.isRemovable || right.isRemovable || up.isRemovable);
}

function getCellLength(boardLength: number, size: number, gup: number) {
  return (boardLength - (size + 1) * gup) / size;
}

function computeTileMove(tileMatrix: TileMatrix) {
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
    gameover,
  };
}

function computeTileMoved(state: State, tileMove: TileMove) {
  const score = state.score + tileMove.score;
  const best = score < state.best ? state.best : score;
  return {
    tileMatrix: tileMove.tileMatrix,
    tiles: tileMove.tileMatrix.tiles,
    score,
    best,
  };
}

function computeMoveAction(state: State, tileMove: TileMove) {
  return {
    ...state,
    ...computeTileMoved(state, tileMove),
    lock: true,
  };
}

export function initState({ size, gup, boardLength, score, best, tiles, history }: InitialState): State {
  const tileMatrix = new TileMatrix(size, tiles);
  if(tiles.length === 0) {
    let addCount = 2;
    while (addCount-- > 0)
      if (!tileMatrix.addTile()) break;
    history[history.length] = { score, best, tiles: tileMatrix.tiles };
    if (history.length > HISTORY_LIMIT) history.shift();
    utils.save(LOCAL_STORAGE_KEY, history);
  }
  const computed = computeTileMove(tileMatrix);
  return {
    size,
    gup,
    boardLength,
    score,
    best,
    cellLength: getCellLength(boardLength, size, gup),
    tileMatrix,
    lock: false,
    history,
    ...computed,
  };
}

export function reducer(state: State, action: ActionTypes): State {
  switch (action.type) {
    case ADD_TILE:
      let addCount = action.addCount;
      while (addCount-- > 0)
        if (!state.tileMatrix.addTile()) break;
      const newState = {
        ...state,
        ...computeTileMove(state.tileMatrix),
        lock: false,
      };
      newState.history[newState.history.length] = { score: newState.score, best: newState.best, tiles: [...newState.tiles] };
      if (newState.history.length > HISTORY_LIMIT) newState.history.shift();
      utils.save(LOCAL_STORAGE_KEY, state.history);
      return newState;
    case LEFT:
      return computeMoveAction(state, state.left);
    case DOWN:
      return computeMoveAction(state, state.down);
    case RIGHT:
      return computeMoveAction(state, state.right);
    case UP:
      return computeMoveAction(state, state.up);
    case SET_BOARD_LENGTH:
      const boardLength = action.boardLength;
      return {
        ...state,
        boardLength,
        cellLength: getCellLength(boardLength, state.size, state.gup),
      };
    case INITI:
      return initState(action.initialState);
    case UNDO:
      state.history.pop();
      utils.save(LOCAL_STORAGE_KEY, state.history);
      const prev = state.history[state.history.length - 1];
      return initState({ ...state, ...prev });
    default:
      return state;
  }
}
