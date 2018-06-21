import { Theme, WithStyles, createStyles, withStyles } from '@material-ui/core/';
import * as React from 'react';
import { ClassKeys } from 'types';

export type MuiComponentClassKeys = ClassKeys<typeof styles>;

export interface MuiComponentProps extends WithStyles<typeof styles> { }

interface MuiComponentState { }

const styles = (theme: Theme) => createStyles({
  root: {},
});

class MuiComponent extends React.Component<MuiComponentProps, MuiComponentState> {
  constructor(props: MuiComponentProps) {
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

export default withStyles(styles)(MuiComponent);

