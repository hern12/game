import createMuiTheme, { ThemeOptions } from 'material-ui/styles/createMuiTheme';
// import { Breakpoint } from 'material-ui/styles/createBreakpoints';
import pink from 'material-ui/colors/pink';
import yellow from 'material-ui/colors/yellow';

// declare module 'material-ui/styles/createMuiTheme' {
//   interface Theme {
//     appDrawer: {
//       width: React.CSSProperties['width']
//       breakpoint: Breakpoint
//     },
//   }
//   interface ThemeOptions {
//     appDrawer?: {
//       width?: React.CSSProperties['width']
//       breakpoint?: Breakpoint
//     }
//   }
// }

export default function createAppTheme(options?: ThemeOptions) {
  return createMuiTheme({
    palette: {
      primary: pink,
      secondary: yellow,
    },
    // appDrawer: {
    //   width: 225,
    //   breakpoint: 'lg',
    // },
    ...options,
  });
}
