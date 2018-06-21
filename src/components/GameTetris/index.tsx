import * as React from 'react';
import { Provider } from 'mobx-react';
import { createStyles, withStyles, Theme, WithStyles } from '@material-ui/core/styles';
import Board from './Board';
import Quadrel from './Quadrel';
import Heap from './Heap';
import Control from './Control';
import stores from './stores';
import { ClassKeys } from 'types';

const styles = (theme: Theme) => createStyles({
  root: {
    position: 'relative',
    margin: theme.spacing.unit * 2,
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
});

export type GameTetrisClassKey = ClassKeys<typeof styles>;

export interface GameTetrisProps extends WithStyles<typeof styles> { }

function GameTetris({ classes }: GameTetrisProps) {
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

export default withStyles(styles)(GameTetris);
