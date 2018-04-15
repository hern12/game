import * as React from 'react';
import { Provider } from 'mobx-react';
import { withStyles, WithStyles } from 'material-ui/styles';
import Board from './Board';
import Tile from './Tile';
import Control from './Control';
import stores from './stores';

export type Game2048ClassKey = 'root' | 'board' | 'tile' | 'control';

const decorate = withStyles<Game2048ClassKey>(
  ({ spacing }) => ({
    root: {
      position: 'relative',
      margin: spacing.unit * 2,
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
  }),
  { name: 'StyledGame2048' }
);
export interface Game2048Props { }

type Game2048PropsWithStyles = Game2048Props & WithStyles<Game2048ClassKey>;

class Game2048 extends React.Component<Game2048PropsWithStyles> {
  constructor(props: Game2048PropsWithStyles) {
    super(props);
  }

  render() {
    const { classes } = this.props;
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
}

export default decorate(Game2048);
