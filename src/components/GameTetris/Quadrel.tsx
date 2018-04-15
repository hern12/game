import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Canvas from '../Canvas';
import { WithQuadrelStore } from './stores';
import grey from 'material-ui/colors/grey';

export interface QuadrelProps { 
  className?: string;
}

type QuadrelPropsWithStore = QuadrelProps & WithQuadrelStore;

@inject('quadrelStore')
@observer 
class Quadrel extends React.Component<QuadrelPropsWithStore> {
  constructor(props: QuadrelPropsWithStore) {
    super(props);
  }

  render() {
    const { className, quadrelStore } = this.props;
    const { width, height, length/*, size*/, gup } = quadrelStore!.boardStore!;
    const { nowQuadrels, nextQuadrels } = quadrelStore!;
    const newWidth = width + 6 * length;
    return (
      <Canvas className={className} width={newWidth} height={height}>
        {(ctx, funs) => {
          ctx.clearRect(0, 0, newWidth, height);

          nowQuadrels.forEach(({ point: { x, y }, color }) => {
            // funs.setRoundedRectPath(ctx, x * length + gup, y * length + gup, size, size, gup / 2);
            funs.setRoundedRectPath(ctx, x * length + gup / 2, y * length + gup / 2, length, length, gup / 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = gup;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
          });

          const farLeft = nextQuadrels.reduce<number>((prev, curr) => prev < curr.point.x ? prev : curr.point.x, 0);
          const farTop = nextQuadrels.reduce<number>((prev, curr) => prev < curr.point.y ? prev : curr.point.y, 0);
          const offsetX = 1 - farLeft;
          const offsetY = 32 + length + gup - farTop * length;
          nextQuadrels.forEach(({ point: { x, y }, color }) => {
            // funs.setRoundedRectPath(ctx, width + (x + offsetX) * length + gup, y * length + gup + offsetY, size, size, gup / 2);
            funs.setRoundedRectPath(ctx, width + (x + offsetX) * length + gup / 2, y * length + gup / 2 + offsetY, length, length, gup / 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = gup;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
          });
          
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'start';
          ctx.textBaseline = 'top';
          ctx.fillStyle = grey[800];
          ctx.fillText('Next', width + length, gup);
        }}
      </Canvas>
    );
  }
}

export default Quadrel as React.ComponentClass<QuadrelProps>;
