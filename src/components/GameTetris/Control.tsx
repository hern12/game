import React from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@material-ui/core/Button';
import Switch from '@material-ui/core/Switch';
import { WithQuadrelStore } from './stores';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const KEY = {
  SPACE: 32,
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  A: 65,
  S: 83,
  D: 68,
  P: 80,
  N: 78,
};

interface ControlProps { 
  className?: string;
}

type ControlPropsWithStore = ControlProps & WithQuadrelStore;

@inject('quadrelStore')
@observer
class Control extends React.Component<ControlPropsWithStore> {
  private leftTimer: number;
  private leftKeyPress = false;
  private rightTimer: number;
  private rightKeyPress = false;
  private downTimer: number;
  private downKeyPress = false;

  constructor(props: ControlPropsWithStore) {
    super(props);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('keyup', this.handleKeyup);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('keyup', this.handleKeyup);
    window.clearInterval(this.downTimer);
    window.clearTimeout(this.leftTimer);
    window.clearTimeout(this.rightTimer);
  }

  handleKeydown = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case KEY.SPACE:
        this.props.quadrelStore!.onChangeForm();
        e.preventDefault();
        break;
      case KEY.LEFT:
      case KEY.A:
        if (!this.leftKeyPress) {
          this.leftKeyPress = true;
          this.props.quadrelStore!.onLeft();
          let timeout = 125;
          const interval = () => {
            window.clearTimeout(this.leftTimer);
            this.props.quadrelStore!.onLeft();
            timeout = Math.max(timeout - 25, 25);
            this.leftTimer = window.setTimeout(interval, timeout);
          }
          this.leftTimer = window.setTimeout(interval, timeout);
        }
        e.preventDefault();
        break;
      case KEY.RIGHT:
      case KEY.D:
        if (!this.rightKeyPress) {
          this.rightKeyPress = true;
          this.props.quadrelStore!.onRight();
          let timeout = 125;
          const interval = () => {
            window.clearTimeout(this.rightTimer);
            this.props.quadrelStore!.onRight();
            timeout = Math.max(timeout - 25, 25);
            this.rightTimer = window.setTimeout(interval, timeout);
          }
          this.rightTimer = window.setTimeout(interval, timeout);
          // this.rightKeyPress = true;
          // this.props.quadrelStore!.onRight();
          // this.rightTimer = window.setInterval(() => this.props.quadrelStore!.onRight(), 100);
        }
        e.preventDefault();
        break;
      case KEY.DOWN:
      case KEY.S:
        if (!this.downKeyPress) {
          this.downKeyPress = true;
          this.props.quadrelStore!.onSpeedUp();
          this.downTimer = window.setInterval(() => this.props.quadrelStore!.onSpeedUp(), 20);
        }
        e.preventDefault();
        break;
      case KEY.P:
        this.handlePause();
        e.preventDefault();
        break;
      case KEY.N:
        this.handleNewGame();
        e.preventDefault();
        break;
    }
  }

  handleKeyup = (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case KEY.LEFT:
      case KEY.A:
        window.clearTimeout(this.leftTimer);
        this.leftKeyPress = false;
        e.preventDefault();
        break;
      case KEY.RIGHT:
      case KEY.D:
        window.clearTimeout(this.rightTimer);
        this.rightKeyPress = false;
        e.preventDefault();
        break;
      case KEY.DOWN:
      case KEY.S:
        window.clearInterval(this.downTimer);
        this.downKeyPress = false;
        this.props.quadrelStore!.onSpeedRecover();
        e.preventDefault();
        break;
    }
  }

  handlePause = () => {
    this.props.quadrelStore!.onTogglePause();
  }

  handleNewGame = () => {
    this.props.quadrelStore!.onReStart();
  }

  render() {
    const { className, quadrelStore } = this.props;
    const { width, height, length, gup } = quadrelStore!.boardStore!;
    return (
      <div className={className} style={{ position: 'absolute', top: height - (72 + 4 * gup), left: width + length }}>
        <FormControlLabel
          label="(P) Pause"
          control={
            <Switch
              color="primary"
              checked={quadrelStore!.pause}
              onChange={this.handlePause}
            />
          }
        />
        <br />
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
