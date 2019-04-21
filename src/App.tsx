import React, { useState, useCallback } from 'react';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Game2048 from './components/Game2048';
import GameTetris from './components/GameTetris';

const games = { GameTetris, Game2048 };

type Games = keyof typeof games;

const useStyles = makeStyles({
  tab: {
    textTransform: 'none',
  },
});

export default function App() {
  const classes = useStyles();
  const [value, setValue] = useState<Games>('GameTetris');
  const Game = games[value];
  const handleChange = useCallback((e: React.ChangeEvent, v: Games) => setValue(v), []);
  return (
    <>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          {Object.keys(games).map((game) => (
            <Tab key={game} value={game} label={game} classes={{ root: classes.tab }} />
          ))}
        </Tabs>
      </AppBar>
      <main>
        <Game />
      </main>
    </>
  );
}
