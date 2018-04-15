import * as React from 'react';
import { configure } from 'mobx';
import { MuiThemeProvider } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import createAppTheme from './theme';
import CssBaseline from 'material-ui/CssBaseline';
import Game2048 from './components/Game2048';
import GameTetris from './components/GameTetris';

configure({ enforceActions: true });

const theme = createAppTheme();

const games = { Game2048, GameTetris };

export interface AppProps { }

type Game = keyof typeof games;

interface AppState {
  game: Game
}

class App extends React.PureComponent<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = { game: 'Game2048' };
  }

  handleChangeGame = (e: React.ChangeEvent<{}>, game: Game) => {
    this.setState({ game });
  }

  render() {
    const { game } = this.state;
    const Game = games[game];
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline>
          <main>
            <AppBar position="static">
              <Tabs value={game} onChange={this.handleChangeGame}>
                <Tab value="Game2048" label="Game 2048" />
                <Tab value="GameTetris" label="Game Tetris" />
              </Tabs>  
            </AppBar>
            <Game />
          </main>
        </CssBaseline>
      </MuiThemeProvider>
    );
  }
}

export default App;
