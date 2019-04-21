import React from 'react';
import { inject, observer } from 'mobx-react';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';
import orange from '@material-ui/core/colors/orange';
import deepOrange from '@material-ui/core/colors/deepOrange';
import pink from '@material-ui/core/colors/pink';
import purple from '@material-ui/core/colors/purple';
import Canvas, { Rect, Text } from '../Canvas';
import { WithTileStore } from './stores';

const red400 = red[400];
const grey50 = grey[50];
const colors = {
  2: orange[50],
  4: orange[200],
  8: deepOrange[200],
  16: deepOrange[300],
  32: red[300],
  64: red[500],
  128: pink[500],
  256: pink[700],
  512: purple[800],
  1024: pink.A700,
  2048: purple.A700,
};

export interface TileProps {
  className?: string;
}

type TilePropsWithStore = TileProps & WithTileStore;

@inject('tileStore')
@observer
class Tile extends React.Component<TilePropsWithStore> {
  constructor(props: TilePropsWithStore) {
    super(props);
  }

  render() {
    const { className, tileStore } = this.props;
    const { width, height, length, size, gup } = tileStore!.boardStore!;
    const { tiles, score, bestScore, gameover } = tileStore!;
    const newWidth = width + 200;
    return (
      <Canvas className={className} width={newWidth} height={height}>
        <Text
          text="Score"
          x={width + gup}
          y={gup}
          fillStyle={grey50}
        />
        <Text
          text={score.toString()}
          x={width + gup}
          y={16 + 2 * gup}
          fillStyle={red400}
        />
        <Text
          text="Best Score"
          x={width + gup}
          y={32 + 3 * gup}
          fillStyle={grey50}
        />
        <Text
          text={bestScore.toString()}
          x={width + gup}
          y={48 + 4 * gup}
          fillStyle={red400}
        />
        {gameover && (
          <Text
            key="gameover"
            text="Gameover!"
            x={width + gup}
            y={64 + 6 * gup}
            fontSize={32}
            fillStyle={red400}
          />
        )}
        {tiles.map(({ value, row, col }, i) => (
          <Rect
            key={'tile' + i}
            x={col * length + gup}
            y={row * length + gup}
            w={size}
            h={size}
            r={gup / 2}
            fillStyle={colors[value]}
          >
            <Text
              text={value.toString()}
              x={col * length + gup + size / 2}
              y={row * length + gup + size / 2}
              fontSize={32}
              textAlign="center"
              textBaseline="middle"
              fillStyle="#000"
            />
          </Rect>
        ))}
      </Canvas>
    );
  }
}

export default Tile as React.ComponentClass<TileProps>;
