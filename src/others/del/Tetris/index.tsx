import * as React from 'react';
import { Provider } from 'mobx-react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Board from './Board';
import Quadrel from './Quadrel';
import stores from './stores'
import Heap from './Heap';

export type TetrisClassKey = 'root' | 'board' | 'heap' | 'quadrel';

const decorate = withStyles<TetrisClassKey>(
  {
    root: {
      position: 'relative',
      margin: 50,
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
  },
  { name: 'StyledTetris' }
);
export interface TetrisProps { }

type TetrisPropsWithStyles = TetrisProps & WithStyles<TetrisClassKey>;

class Tetris extends React.Component<TetrisPropsWithStyles> {
  constructor(props: TetrisPropsWithStyles) {
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
        </div>
      </Provider>
    );
  }
}

export default decorate(Tetris);
