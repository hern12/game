import AppBar from '@material-ui/core/AppBar';
import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import * as React from 'react';
import Game2048 from './components/Game2048';
import GameTetris from './components/GameTetris';

const games = { GameTetris, Game2048 };

type Games = keyof typeof games;

const styles = createStyles({
  labelContainer: {
    textTransform: 'none',
  },
});

export interface AppProps extends WithStyles<typeof styles> { }

interface AppState {
  value: Games;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = { value: 'GameTetris' };
  }

  handleChange = (e: React.ChangeEvent, value: Games) => {
    this.setState({ value });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    const Game = games[value];
    return (
      <>
        <AppBar position="static">
          <Tabs value={value} onChange={this.handleChange}>
            {Object.keys(games).map((game) => (
              <Tab key={game} value={game} label={game} classes={{ labelContainer: classes.labelContainer }} />
            ))}
          </Tabs>
        </AppBar>
        <main>
          <Game />
        </main>
      </>
    );
  }
}

export default withStyles(styles)(App);
