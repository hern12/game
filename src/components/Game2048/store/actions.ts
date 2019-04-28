import { LEFT, DOWN, RIGHT, UP, SET_BOARD_LENGTH, INITI, InitialState, ActionTypes } from './types';

export function left(): ActionTypes {
  return { type: LEFT };
}

export function down(): ActionTypes {
  return { type: DOWN };
}

export function right(): ActionTypes {
  return { type: RIGHT };
}

export function up(): ActionTypes {
  return { type: UP };
}

export function setBoardLength(boardLength: number): ActionTypes {
  return { type: SET_BOARD_LENGTH, boardLength };
}

export function init(initialState: InitialState): ActionTypes {
  return { type: INITI, initialState };
}
