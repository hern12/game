import React from 'react';
import { inject, observer } from 'mobx-react';
import grey from '@material-ui/core/colors/grey';
import Canvas, { Rect, Text } from '../Canvas';
import { WithQuadrelStore } from './stores';

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
    const { width, height, length, gup } = quadrelStore!.boardStore!;
    const { nowQuadrels, nextQuadrels, show } = quadrelStore!;
    const farLeft = nextQuadrels.reduce<number>((prev, curr) => prev < curr.point.x ? prev : curr.point.x, 0);
    const farTop = nextQuadrels.reduce<number>((prev, curr) => prev < curr.point.y ? prev : curr.point.y, 0);
    const offsetX = 1 - farLeft;
    const offsetY = 32 + length + gup - farTop * length;
    return (
      <Canvas className={className} width={width + 6 * length} height={height}>
        <Text
          text="Next"
          x={width + length}
          y={gup}
          fontSize={32}
          textAlign="start"
          textBaseline="top"
          fillStyle={grey[50]}
        />
        {nextQuadrels.map(({ point: { x, y }, color }, i) => (
          <Rect
            key={'next' + i}
            x={width + (x + offsetX) * length + gup / 2}
            y={y * length + gup / 2 + offsetY}
            w={length}
            h={length}
            r={gup / 2}
            fillStyle={color}
            strokeStyle="#fff"
            lineWidth={gup}
          />
        ))}
        {show && nowQuadrels.map(({ point: { x, y }, color }, i) => (
          <Rect
            key={'now' + i}
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

export default Quadrel as React.ComponentClass<QuadrelProps>;
