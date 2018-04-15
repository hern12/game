import * as React from 'react';
import { withStyles, WithStyles } from 'material-ui/styles';

export type MuiComponentClassKey = 'root' | 'class1';

const decorate = withStyles<MuiComponentClassKey>(
  theme => {
    return {
      root: {},
      class1: {},
      '@global': {
        html: {
          fontSize: '14px',
        },
        body: {
          margin: 0,
          padding: 0,
        },
        '#root': {
          overflow: 'hidden',
        },
      }
    };
  },
  { name: 'StyledMuiComponent' }
);

export interface MuiComponentProps { }

interface MuiComponentState { }

type MuiComponentPropsWithStyles = MuiComponentProps & WithStyles<MuiComponentClassKey>;

class MuiComponent extends React.Component<MuiComponentPropsWithStyles, MuiComponentState> {
  static defaultProps: Partial<MuiComponentPropsWithStyles> = {};

  constructor(props: MuiComponentPropsWithStyles) {
    super(props);
    this.state = {};
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}></div>
    );
  }
}

export default decorate(MuiComponent);
