import React from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import { WithTileStore } from './stores';

const KEY = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  S: 83,
  D: 68,
  W: 87,
  N: 78,
};

interface ControlProps { 
  className?: string;
}

type ControlPropsWithStore = ControlProps & WithTileStore;

@inject('tileStore')
@observer
class Control extends React.Component<ControlPropsWithStore> {
  constructor(props: ControlPropsWithStore) {
    super(props);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown = (e: KeyboardEvent) => {
    const tileStore = this.props.tileStore!;
    switch (e.keyCode) {
      case KEY.UP:
      case KEY.W:
        tileStore.onMove(tileStore.up);
        e.preventDefault();
        break;  
      case KEY.LEFT:
      case KEY.A:
        tileStore.onMove(tileStore.left);
        e.preventDefault();
        break;
      case KEY.RIGHT:
      case KEY.D:
        tileStore.onMove(tileStore.right);
        e.preventDefault();
        break;
      case KEY.DOWN:
      case KEY.S:
        tileStore.onMove(tileStore.down);
        e.preventDefault();
        break;
      case KEY.N:
        this.handleNewGame();
        e.preventDefault();
        break;
    }
  }

  handleNewGame = () => {
    this.props.tileStore!.onRestart();
  }

  render() {
    const { className, tileStore } = this.props;
    const { width, height, gup } = tileStore!.boardStore!;
    return (
      <div className={className} style={{ position: 'absolute', top: height - (36 + 2 * gup), left: width + gup }}>
        <Button
          variant="contained"
          color="primary"
          style={{ margin: gup }}
          onClick={this.handleNewGame}
        >
          (N) NewGame
        </Button>
      </div>
    );
  }
}

export default Control as React.ComponentClass<ControlProps>;
