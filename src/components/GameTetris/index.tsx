import * as React from 'react';
import { Provider } from 'mobx-react';
import { withStyles, WithStyles } from 'material-ui/styles';
import Board from './Board';
import Quadrel from './Quadrel';
import Heap from './Heap';
import Control from './Control';
import stores from './stores';

export type GameTetrisClassKey = 'root' | 'board' | 'heap' | 'quadrel' | 'control';

const decorate = withStyles<GameTetrisClassKey>(
  ({ spacing }) => ({
    root: {
      position: 'relative',
      margin: spacing.unit * 2,
    },
    board: {
      position: 'absolute',
      zIndex: 1,
    },
    heap: {
      position: 'absolute',
      zIndex: 2,
    },
    quadrel: {
      position: 'absolute',
      zIndex: 3,
    },
    control: {
      zIndex: 4,
    }
  }),
  { name: 'StyledGameTetris' }
);
export interface GameTetrisProps { }

type GameTetrisPropsWithStyles = GameTetrisProps & WithStyles<GameTetrisClassKey>;

class GameTetris extends React.Component<GameTetrisPropsWithStyles> {
  constructor(props: GameTetrisPropsWithStyles) {
    super(props);
  }

  render() {
    const { classes } = this.props;
    return (
      <Provider {...stores}>
        <div className={classes.root}>
          <Board className={classes.board} />
          <Heap className={classes.heap} />
          <Quadrel className={classes.quadrel} />
          <Control className={classes.control} />
        </div>
      </Provider>
    );
  }
}

export default decorate(GameTetris);
