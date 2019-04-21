import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { Provider } from 'mobx-react';
import Board from './Board';
import Tile from './Tile';
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
  tile: {
    position: 'absolute',
    zIndex: 2,
  },
  control: {
    position: 'absolute',
    zIndex: 3,
  },
}));

export default function Game2048() {
  const classes = useStyles();
  return (
    <Provider {...stores}>
      <div className={classes.root}>
        <Board className={classes.board} />
        <Tile className={classes.tile} />
        <Control className={classes.control} />
      </div>
    </Provider>
  );
}
