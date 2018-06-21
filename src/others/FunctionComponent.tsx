import { Theme, WithStyles, createStyles, withStyles } from '@material-ui/core/';
import * as React from 'react';
import { ClassKeys } from 'types';

export type MuiComponentClassKeys = ClassKeys<typeof styles>;

export interface MuiComponentProps extends WithStyles<typeof styles> { }

const styles = (theme: Theme) => createStyles({
  root: {},
});

function MuiComponent(props: MuiComponentProps) {
  const { classes } = props;
  return (
    <div className={classes.root}></div>
  );
}

export default withStyles(styles)(MuiComponent);

