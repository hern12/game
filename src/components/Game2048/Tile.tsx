import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Canvas from '../Canvas';
import { WithTileStore } from './stores';
import orange from 'material-ui/colors/orange';
import deepOrange from 'material-ui/colors/deepOrange';
import red from 'material-ui/colors/red';
import pink from 'material-ui/colors/pink';
import purple from 'material-ui/colors/purple';
import grey from 'material-ui/colors/grey';

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
        {(ctx, funs) => {
          ctx.clearRect(0, 0, newWidth, height);

          tiles.forEach(({ value, row, col }) => {
            funs.setRoundedRectPath(ctx, col * length + gup, row * length + gup, size, size, gup / 2);
            ctx.fillStyle = colors[value];
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '32px sans-serif';
            ctx.fillStyle = grey[800];
            ctx.fillText(value.toString(), col * length + gup + size / 2, row * length + gup + size / 2);
          
            ctx.textAlign = 'start';
            ctx.textBaseline = 'top';
            ctx.font = '16px sans-serif';
            ctx.fillStyle = grey[800];
            ctx.fillText('Score', width + gup, gup);
            ctx.fillStyle = red[800];
            ctx.fillText(score.toString(), width + gup, 16 + 2 * gup);

            ctx.fillStyle = grey[800];
            ctx.fillText('BestScore', width + gup, 32 + 3 * gup);
            ctx.fillStyle = red[800];
            ctx.fillText(bestScore.toString(), width + gup, 48 + 4 * gup);

            if (gameover) {
              ctx.font = '32px sans-serif';
              ctx.fillStyle = red[800];
              ctx.fillText('Gameover!', width + gup, 64 + 6 * gup);
            }
          });
        }}
      </Canvas>
    );
  }
}

export default Tile as React.ComponentClass<TileProps>;
