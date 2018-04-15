import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Canvas from '../Canvas';
import { WithBoardStore } from './stores';
import grey from 'material-ui/colors/grey';

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
    let flag1 = true;
    let flag2 = flag1;
    return (
      <Canvas className={className} width={width} height={height}>
        <Canvas.RoundedRect key="board-background" width={width} height={height} radius={gup} fill='#fff' />
        {Array(row).fill(1).map((v1, r) => {
          flag1 = !flag1;
          flag2 = flag1;
          return Array(col).fill(1).map((v2, c) => {
            flag2 = !flag2;
            let x = c * length + gup;
            let y = r * length + gup;
            let color = flag2 ? grey[200] : grey[300];
            return (
              <Canvas.RoundedRect key={`board-grid(${r},${c})`} x={x} y={y} width={size} height={size} radius={gup} fill={color} />
            );
          })
        })}
      </Canvas>
    );
  }
}

export default Board as React.ComponentClass<BoardProps>;
