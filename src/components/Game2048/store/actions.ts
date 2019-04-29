import { ADD_TILE, LEFT, DOWN, RIGHT, UP, SET_BOARD_LENGTH, INITI, InitialState, ActionTypes } from './types';

export function addTile(addCount = 1): ActionTypes {
  return { type: ADD_TILE, addCount };
}

export function moveLeft(): ActionTypes {
  return { type: LEFT };
}

export function moveDown(): ActionTypes {
  return { type: DOWN };
}

export function moveRight(): ActionTypes {
  return { type: RIGHT };
}

export function moveUp(): ActionTypes {
  return { type: UP };
}

export function setBoardLength(boardLength: number): ActionTypes {
  return { type: SET_BOARD_LENGTH, boardLength };
}

export function init(initialState: InitialState): ActionTypes {
  return { type: INITI, initialState };
}
