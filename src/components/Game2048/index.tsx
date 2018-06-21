import * as React from 'react';
import { Provider } from 'mobx-react';
import { createStyles, withStyles, Theme, WithStyles } from '@material-ui/core/styles';
import Board from './Board';
import Tile from './Tile';
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
  tile: {
    position: 'absolute',
    zIndex: 2,
  },
  control: {
    position: 'absolute',
    zIndex: 3,
  },
});

export type Game2048ClassKey = ClassKeys<typeof styles>;
  
export interface Game2048Props extends WithStyles<typeof styles> { }

function Game2048({ classes }: Game2048Props) {
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

export default withStyles(styles)(Game2048);
