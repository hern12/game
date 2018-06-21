import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import Canvas from '../Canvas';
import { WithHeapStore } from './stores';

const red400 = red[400];
const grey50 = grey[50];

export interface HeapProps {
  className?: string;
}

type HeapPropsWithStore = HeapProps & WithHeapStore;

@inject('heapStore')
@observer  
class Heap extends React.Component<HeapPropsWithStore> {
  constructor(props: HeapPropsWithStore) {
    super(props);
  }

  render() {
    const { className, heapStore } = this.props;
    const { width, height, length/*, size*/, gup } = heapStore!.boardStore;
    const { heap, score, bestScore, gameover } = heapStore!;
    const newWidth = width + 6 * length;
    return (
      <Canvas className={className} width={newWidth} height={height}>
        {(ctx, funs) => {
          ctx.clearRect(0, 0, newWidth, height);

          heap.forEach(({ point: { x, y }, color }) => {
            // funs.setRoundedRectPath(ctx, x * length + gup, y * length + gup, size, size, gup / 2);
            funs.setRoundedRectPath(ctx, x * length + gup / 2, y * length + gup / 2, length, length, gup / 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = gup;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
          });

          const top = 6 * length + gup + 32;
          ctx.textAlign = 'start';
          ctx.textBaseline = 'top';
          ctx.font = '16px sans-serif';
          ctx.fillStyle = grey50;
          ctx.fillText('Score', width + length, top + 2 * gup);
          ctx.fillStyle = red400;
          ctx.fillText(score.toString(), width + length, top + 16 + 4 * gup);

          ctx.fillStyle = grey50;
          ctx.fillText('BestScore', width + length, top + 32 + 6 * gup);
          ctx.fillStyle = red400;
          ctx.fillText(bestScore.toString(), width + length, top + 48 + 8 * gup);

          if (gameover) {
            ctx.font = '32px sans-serif';
            ctx.fillStyle = red400;
            ctx.fillText('Gameover!', width + length, top + 64 + 10 * gup);
          }
        }}
      </Canvas>
    );
  }
}

export default Heap as React.ComponentClass<HeapProps>;
