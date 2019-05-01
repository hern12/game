import React, { useReducer, useRef, useMemo, useCallback, useEffect } from 'react';
import Canvas, { Layout, Rect, Text } from '../Canvas';
import { InitialState, HistoryState } from './store/types';
import { addTile, moveLeft, moveDown, moveRight, moveUp, setBoardLength, init, undo } from './store/actions';
import { reducer, initState, LOCAL_STORAGE_KEY } from './store/reducer';
import { Tile } from './store/TileMatrix';
import { utils } from 'utils';
// import clsx from 'clsx';

const COLORS = {
  2: '#fff9c4',
  4: '#ffe082',
  8: '#ffb74d',
  16: '#ffab91',
  32: '#ef9a9a',
  64: '#f06292',
  128: '#ab47bc',
  256: '#9575cd',
  512: '#0091ea',
  1024: '#00b8d4',
  2048: '#00bfa5',
  4096: '#00c853',
  8192: '#aeea00',
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
// const FRAME_TIME = 16.7;

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

function getInitialState(): InitialState {
  const gup = 8,
    history = utils.load<HistoryState[]>(LOCAL_STORAGE_KEY) || [];
  let score = 0,
    best = 0,
    tiles: Tile[] = [];
  if (history.length) {
    const lastHistory = history[history.length - 1];
    tiles = lastHistory.tiles;
    score = lastHistory.score;
    best = lastHistory.best;
  }
  return {
    size: 4,
    gup,
    boardLength: getBoardLength(gup, window.innerWidth),
    score,
    best,
    tiles,
    history,
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
  // tiles = [];
  // let v = 2;
  // for (let r = 0; r < 4; r++) {
  //   for (let c = 0; c < 4; c++) {
  //     tiles[tiles.length] = { x: c, y: r, value: v };
  //     v *= 2;
  //     if (v > 8192) v = 2;
  //   }
  // }
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
  const { size, gup, boardLength, cellLength, score, best, tiles, left, down, right, up, gameover, lock, history } = state;

  const timerRef = useRef<number>();
  const isLarger = boardLength > ((MAX + MIN) / 2) - gup;

  const scoreLayout = useMemo(() => {
    return getScoreLayout(SCORE_HEIGHT, gup, boardLength, score, best, isLarger)
  }, [score, best, boardLength, gup, isLarger]);
  const boardCells = useMemo(() => {
    return getBoardCells(size, gup, cellLength)
  }, [cellLength, gup, size]);
  const tileCells = useMemo(() => {
    return getTileCells(tiles, gup, cellLength, isLarger)
  }, [tiles, cellLength, gup, isLarger]);

  const handleAddTile = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => dispatch(addTile()), 255);
  }, [dispatch]);
  const handleLeft = useCallback(() => {
    if (!lock && left.isRemovable) {
      dispatch(moveLeft());
      handleAddTile();
    }
  }, [lock, left, dispatch]);
  const handleDown = useCallback(() => {
    if (!lock && down.isRemovable) {
      dispatch(moveDown());
      handleAddTile();
    }
  }, [lock, down, dispatch]);
  const handleRight = useCallback(() => {
    if (!lock && right.isRemovable) {
      dispatch(moveRight());
      handleAddTile();
    }
  }, [lock, right, dispatch]);
  const handleUp = useCallback(() => {
    if (!lock && up.isRemovable) {
      dispatch(moveUp());
      handleAddTile();
    }
  }, [lock, up, dispatch]);
  const handleUndo = useCallback(() => {
    if (!lock && history.length > 1) {
      dispatch(undo());
    }
  }, [lock, history, dispatch]);
  const handleNewGame = useCallback(() => {
    dispatch(init({ size, gup, boardLength, best, score: 0, tiles: [], history }));
  }, [best, boardLength, size, gup, dispatch]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      utils.handleKey(e, [
        [[KEY.LEFT, KEY.A], handleLeft],
        [[KEY.DOWN, KEY.S], handleDown],
        [[KEY.RIGHT, KEY.D], handleRight],
        [[KEY.UP, KEY.W], handleUp]
      ]);
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleLeft, handleDown, handleRight, handleUp, dispatch]);

  useEffect(() => {
    const handleResize = () => dispatch(setBoardLength(getBoardLength(gup, window.innerWidth)));
    window.addEventListener('resize', handleResize);
    return () => removeEventListener('resize', handleResize);
  }, [dispatch, gup]);

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

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
          <button className="btn" onClick={handleUndo} disabled={lock || history.length <= 1}>Undo</button>
        </div>
        <div className="arraw-group">
          <div>
            <button className="btn" disabled={lock || !up.isRemovable} onClick={handleUp}>
              <span className="iconfont">&#xe7ed;</span>
            </button>
          </div>
          <div>
            <button className="btn" disabled={lock || !left.isRemovable} onClick={handleLeft}>
              <span className="iconfont">&#xe7ec;</span>
            </button>
            <button className="btn" disabled={lock || !down.isRemovable} onClick={handleDown}>
              <span className="iconfont">&#xe7ee;</span>
            </button>
            <button className="btn" disabled={lock || !right.isRemovable} onClick={handleRight}>
              <span className="iconfont">&#xe7eb;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
