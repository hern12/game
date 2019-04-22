import React from 'react';
import { inject, observer } from 'mobx-react';
import brown from '@material-ui/core/colors/brown';
import Canvas, { Rect } from '../Canvas';
import { WithBoardStore } from './stores';

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
    const tiles = [];
    for (let y = 0; y < row; y++) {
      for (let x = 0; x < col; x++) {
        tiles[tiles.length] = (
          <Rect
            key={y + '/' + x}
            x={x * length + gup}
            y={y * length + gup}
            w={size}
            h={size}
            fillStyle={brown[100]}
          />
        );
      }
    }

    return (
      <Canvas className={className} width={newWidth} height={height}>
        <Rect w={width} h={height} fillStyle={brown[200]} />
        {tiles}
      </Canvas>
    );
  }
}

export default Board as React.ComponentClass<BoardProps>;
