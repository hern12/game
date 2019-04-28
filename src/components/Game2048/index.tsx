import React, { useReducer, useMemo, useCallback, useEffect } from 'react';
import Canvas, { Layout, Rect, Text } from '../Canvas';
import { InitialState } from './store/types';
import { left, down, right, up, setBoardLength, init } from './store/actions';
import { reducer, initState } from './store/reducer';
import { Tile } from './store/TileMatrix';
// import clsx from 'clsx';

const COLORS = {
  2: '#fff3e0',
  4: '#ffcc80',
  8: '#ffab91',
  16: '#ff8a65',
  32: '#e57373',
  64: '#f44336',
  128: '#e91e63',
  256: '#c2185b',
  512: '#8e24aa',
  1024: '#c51162',
  2048: '#aa00ff',
  cell: '#d7ccc8',
  board: '#bcaaa4',
  title: '#0091ea',
  score: '#ec407a',
  scoreNumber: '#f1f8e9',
  scoreText: '#efebe9',
  best: '#ff5722',
  bestNumber: '#f1f8e9',
  bestText: '#efebe9',
  gameover: '#efebe9aa',
  gameoverText: '#795548',
  black: '#212121',
};

const FONTSIZES = {
  1: [34, 42] as const,
  2: [30, 36] as const,
  3: [26, 34] as const,
  4: [22, 32] as const,
};

const MAX = 640;
const MIN = 320;
const SCORE_HEIGHT = 64;

const KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  S: 83,
  D: 68,
  W: 87,
};

function getBoardLength(gup: number, width: number) {
  return (width > MAX ? MAX : width < MIN ? MIN : width) - 2 * gup;
}

function getInitialState(width = window.innerWidth, size = 4, gup = 8, score = 0, best = 0, tiles: Tile[] = []): InitialState {
  return {
    size,
    gup,
    boardLength: getBoardLength(gup, width),
    score,
    best,
    tiles,
  };
}

function getScoreLayout(height: number, gup: number, boardLength: number, score: number, best: number, isLarger: boolean) {
  const textHeight = height / 2.5;
  const textFontSize = isLarger ? 16 : 12;
  const numberFontSize = textFontSize * 2;
  return (
    <Layout column h={height + 2 * gup}>
      <Text text="2048" w={boardLength / 2} h={height + 2 * gup} fontSize={height / 4 * 3} fillStyle={COLORS.title} fontWeight="bold" textAlign="center" textBaseline="middle" />
      <Rect x={gup} y={gup} w={boardLength / 4 - gup} h={height} r={gup / 2} fillStyle={COLORS.score} fontWeight="bold" textAlign="center" textBaseline="middle">
        <Text text="SCORE" h={textHeight} fontSize={textFontSize} fillStyle={COLORS.scoreText} />
        <Text text={score} y={textHeight} h={height - textHeight} fontSize={numberFontSize} fillStyle={COLORS.scoreNumber} />
      </Rect>
      <Rect x={gup} y={gup} w={boardLength / 4 - gup} h={height} r={gup / 2} fillStyle={COLORS.best} fontWeight="bold" textAlign="center" textBaseline="middle">
        <Text text="BEST" h={textHeight} fontSize={textFontSize} fillStyle={COLORS.bestText} />
        <Text text={best} y={textHeight} h={height - textHeight} fontSize={numberFontSize} fillStyle={COLORS.bestNumber} />
      </Rect>
    </Layout>
  );
}

function getBoardCells(size: number, gup:number, cellLength: number) {
  const result = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      result[result.length] = (
        <Rect
          key={y + '/' + x}
          x={x * (cellLength + gup) + gup}
          y={y * (cellLength + gup) + gup}
          w={cellLength}
          h={cellLength}
          r={gup / 2}
          fillStyle={COLORS.cell}
        />
      );
    }
  }
  return result;
}

function getTileCells(tiles: Tile[], gup: number, cellLength: number, isLarger: boolean) {
  const fontIndex = isLarger ? 1 : 0;
  // tiles = [{ x: 1, y: 0, value: 4 }, { x: 1, y: 1, value: 64 }, { x: 1, y: 2, value: 512, }, { x: 1, y: 3, value: 2048 }];
  return tiles.map(({ x, y, value }, i) => (
    <Rect
      key={'tile' + i}
      x={x * (cellLength + gup) + gup}
      y={y * (cellLength + gup) + gup}
      w={cellLength}
      h={cellLength}
      r={gup / 2}
      fillStyle={COLORS[value]}
      fontFillStyle={COLORS.black}
      fontSize={FONTSIZES[value.toString().length][fontIndex]}
      fontWeight="bold"
      textAlign="center"
      textBaseline="middle"
    >
      {value}
    </Rect>
  ));
}

export default function Game2048() {
  const [state, dispatch] = useReducer(reducer, getInitialState(), initState);
  const { size, gup, boardLength, cellLength, score, best, tiles, gameover } = state;
  const isLarger = boardLength > ((MAX + MIN) / 2) - gup;
  const scoreLayout = useMemo(() => getScoreLayout(SCORE_HEIGHT, gup, boardLength, score, best, isLarger), [score, best, boardLength, gup, isLarger]);
  const boardCells = useMemo(() => getBoardCells(size, gup, cellLength), [cellLength, gup, size]);
  const tileCells = useMemo(() => getTileCells(tiles, gup, cellLength, isLarger), [tiles, cellLength, gup, isLarger]);

  const handleNewGame = useCallback(() => dispatch(init({ size, gup, boardLength, best, score: 0, tiles: [] })), [dispatch, best, boardLength, size, gup]);
  const handleLeft = useCallback(() => dispatch(left()), [dispatch]);
  const handleDown = useCallback(() => dispatch(down()), [dispatch]);
  const handleRight = useCallback(() => dispatch(right()), [dispatch]);
  const handleUp = useCallback(() => dispatch(up()), [dispatch]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case KEY.LEFT:
        case KEY.A:
          dispatch(left());
          e.preventDefault();
          break;
        case KEY.DOWN:
        case KEY.S:
          dispatch(down());
          e.preventDefault();
          break;
        case KEY.RIGHT:
        case KEY.D:
          dispatch(right());
          e.preventDefault();
          break;
        case KEY.UP:
        case KEY.W:
          dispatch(up());
          e.preventDefault();
          break;
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => dispatch(setBoardLength(getBoardLength(gup, window.innerWidth)));
    window.addEventListener('resize', handleResize);
    return () => removeEventListener('resize', handleResize);
  }, [dispatch, gup]);

  return (
    <div className="center" style={{ width: boardLength }}>
      <Canvas width={boardLength} height={boardLength + SCORE_HEIGHT + 3 * gup}>
        <Layout>
          {scoreLayout}
          <Rect x={0} y={0} w={boardLength} h={boardLength} r={gup / 2} fillStyle={COLORS.board}>
            {boardCells}
            {tileCells}
            {gameover && (
              <Rect
                key="gameover"
                x={0}
                y={0}
                w={boardLength}
                h={boardLength}
                r={gup / 2}
                fillStyle={COLORS.gameover}
                fontFillStyle={COLORS.gameoverText}
                fontSize={boardLength / 8}
                fontWeight="bold"
                textAlign="center"
                textBaseline="middle"
              >
                Game over!
            </Rect>
            )}
          </Rect>
        </Layout>
      </Canvas>
      <div className="control">
        <div className="btn-group">
          <button className="btn" onClick={handleNewGame}>New Game</button>
          <button className="btn" disabled>Undo</button>
        </div>
        <div className="arraw-group">
          <div>
            <button className="btn" disabled={!state.up.isRemovable} onClick={handleUp}>
              <span className="iconfont">&#xe7ed;</span>
            </button>
          </div>
          <div>
            <button className="btn" disabled={!state.left.isRemovable} onClick={handleLeft}>
              <span className="iconfont">&#xe7ec;</span>
            </button>
            <button className="btn" disabled={!state.down.isRemovable} onClick={handleDown}>
              <span className="iconfont">&#xe7ee;</span>
            </button>
            <button className="btn" disabled={!state.right.isRemovable} onClick={handleRight}>
              <span className="iconfont">&#xe7eb;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
