import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Canvas from '../Canvas';
import { WithBoardStore } from './stores';
import brown from 'material-ui/colors/brown';

export interface BoardProps {
  className?: string;
 }

type BoardPropsWithStore = BoardProps & WithBoardStore;

@inject('boardStore')
@observer  
class Board extends React.Component<BoardPropsWithStore> {
  constructor(props: BoardPropsWithStore) {
    super(props);
  }

  render() {
    const { className, boardStore } = this.props;
    const { width, height, length, row, col, size, gup } = boardStore!;
    const newWidth = width + 6 * length;
    return (
      <Canvas className={className} width={newWidth} height={height}>
        {(ctx, funs) => {
          ctx.clearRect(0, 0, newWidth, height);

          ctx.fillStyle = brown[200];
          funs.setRoundedRectPath(ctx, 0, 0, width, height, gup);
          ctx.fill();

          ctx.fillStyle = brown[100];
          for (let y = 0; y < row; y++) {
            for (let x = 0; x < col; x++) {
              funs.setRoundedRectPath(ctx, x * length + gup, y * length + gup, size, size, gup / 2);
              ctx.fill();
            }
          }
        }}
      </Canvas>
    );
  }
}

export default Board as React.ComponentClass<BoardProps>;
