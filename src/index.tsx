import React from 'react';
import ReactDOM from 'react-dom';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import brown from '@material-ui/core/colors/brown';
import pink from '@material-ui/core/colors/pink';
import CssBaseline from '@material-ui/core/CssBaseline';
import { configure } from 'mobx';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

configure({ enforceActions: 'observed' });

const theme = createMuiTheme({
  palette: {
    primary: brown,
    secondary: pink,
    type: 'dark',
  },
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
