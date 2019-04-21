import React from 'react';
import { inject, observer } from 'mobx-react';
import grey from '@material-ui/core/colors/grey';
import red from '@material-ui/core/colors/red';
import Canvas, { Rect, Text } from '../Canvas';
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
    const top = 6 * length + gup + 32;
    return (
      <Canvas className={className} width={newWidth} height={height}>
        <Text
          text="Score"
          x={width + length}
          y={top + 2 * gup}
          fillStyle={grey50}
        />
        <Text
          text={score.toString()}
          x={width + length}
          y={top + 16 + 4 * gup}
          font="16px"
          fillStyle={red400}
        />
        <Text
          text="Best Score"
          x={width + length}
          y={top + 32 + 6 * gup}
          fillStyle={grey50}
        />
        <Text
          text={bestScore.toString()}
          x={width + length}
          y={top + 48 + 8 * gup}
          fillStyle={red400}
        />
        {gameover && (
          <Text
            key="gameover"
            text="Gameover!"
            x={width + length}
            y={top + 64 + 10 * gup}
            fontSize={32}
            fillStyle={red400}
          />
        )}
        {heap.map(({ point: { x, y }, color }, i) => (
          <Rect
            key={'next' + i}
            x={x * length + gup / 2}
            y={y * length + gup / 2}
            w={length}
            h={length}
            r={gup / 2}
            fillStyle={color}
            strokeStyle="#fff"
            lineWidth={gup}
          />
        ))}
      </Canvas>
    );
  }
}

export default Heap as React.ComponentClass<HeapProps>;
