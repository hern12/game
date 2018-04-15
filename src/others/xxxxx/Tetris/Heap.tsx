import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Canvas from '../Canvas';
import { WithHeapStore } from './stores';

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
    const { width, height, length, size, gup } = heapStore!.boardStore;
    const { heap } = heapStore!;
    return (
      <Canvas className={className} width={width} height={height}>
        {heap.map(({ point: { x, y }, color }) => (
          <Canvas.RoundedRect
            key={x + y + color}
            x={x * length + gup}
            y={y * length + gup}
            width={size}
            height={size}
            radius={gup}
            fill={color}
          />
        ))}
      </Canvas>
    );
  }
}

export default Heap as React.ComponentClass<HeapProps>;
