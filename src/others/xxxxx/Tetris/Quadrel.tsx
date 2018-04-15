import * as React from 'react';
import { inject, observer } from 'mobx-react';
import Canvas from '../Canvas';
import { WithQuadrelStore } from './stores';

const KEY = {
  SPACE: 32,
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  S: 83,
  D: 68,
  T: 84,
  N: 78,
};

export interface QuadrelProps { 
  className?: string;
}

type QuadrelPropsWithStore = QuadrelProps & WithQuadrelStore;

@inject('quadrelStore')
@observer 
class Quadrel extends React.Component<QuadrelPropsWithStore> {
  private timer: number;
  private keyDownPress = false;

  constructor(props: QuadrelPropsWithStore) {
    super(props);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('keyup', this.handleKeyup);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keyup', this.handleKeyup);
    window.clearInterval(this.timer);
  }

  handleKeydown = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case KEY.SPACE:
        this.props.quadrelStore!.onChangeType();
        e.preventDefault();
        break;
      case KEY.LEFT:
      case KEY.A:
        this.props.quadrelStore!.onLeft();
        e.preventDefault();  
        break;
      case KEY.RIGHT:
      case KEY.D:
        this.props.quadrelStore!.onRight();
        e.preventDefault();
        break;
      case KEY.DOWN:
      case KEY.S:
        if (!this.keyDownPress) {
          this.keyDownPress = true;
          this.timer = window.setInterval(() => this.props.quadrelStore!.onSpeedUp(), 20);
        }  
        e.preventDefault();
        break;
      case KEY.T:
        this.props.quadrelStore!.onTogglePause();
        e.preventDefault();  
        break;
      case KEY.N:
        this.props.quadrelStore!.onReStart();
        e.preventDefault();
        break;
    }
  }

  handleKeyup = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case KEY.DOWN:
      case KEY.S:
        window.clearInterval(this.timer);
        this.keyDownPress = false;
        this.props.quadrelStore!.onSpeedRecover();
        e.preventDefault();
        break;
    }
  }

  render() {
    const { className, quadrelStore } = this.props;
    const { width, height, length, size, gup } = quadrelStore!.boardStore!;
    const { nowQuadrels } = quadrelStore!;
    return (
      <Canvas className={className} width={width} height={height}>
        {nowQuadrels.map(({ point: { x, y }, color }) => (
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

export default Quadrel as React.ComponentClass<QuadrelProps>;
