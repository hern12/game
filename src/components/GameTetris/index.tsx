import * as React from 'react';
import { Provider } from 'mobx-react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import Board from './Board';
import Quadrel from './Quadrel';
import Heap from './Heap';
import Control from './Control';
import stores from './stores';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'relative',
    margin: theme.spacing(2),
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
}));

export default function GameTetris() {
  const classes = useStyles();
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
