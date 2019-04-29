import TileMatrix, { Tile } from './TileMatrix';

export const ADD_TILE = 'ADD_TILE';
export const LEFT = 'LEFT';
export const DOWN = 'DOWN';
export const RIGHT = 'RIGHT';
export const UP = 'UP';
export const SET_BOARD_LENGTH = 'SET_BOARD_LENGTH';
export const INITI = 'INITI';

export interface InitialState {
  size: number;
  gup: number;
  boardLength: number;
  score: number;
  best: number;
  tiles: Tile[];
}

export interface State extends InitialState {
  tileMatrix: TileMatrix;
  cellLength: number;
  left: TileMove;
  right: TileMove;
  up: TileMove;
  down: TileMove;
  gameover: boolean;
  lock: boolean;
}

export interface TileMove {
  isRemovable: boolean;
  score: number;
  tileMatrix: TileMatrix;
}

interface AddTileAction {
  type: typeof ADD_TILE;
  addCount: number;
}

interface LeftAction {
  type: typeof LEFT;
}

interface DownAction {
  type: typeof DOWN;
}

interface RightAction {
  type: typeof RIGHT;
}

interface UPAction {
  type: typeof UP;
}

interface SetBoardLengthAction {
  type: typeof SET_BOARD_LENGTH;
  boardLength: number;
}

interface InitiAction {
  type: typeof INITI;
  initialState: InitialState;
}

export type ActionTypes =
  | AddTileAction
  | LeftAction
  | DownAction
  | RightAction
  | UPAction
  | SetBoardLengthAction
  | InitiAction;