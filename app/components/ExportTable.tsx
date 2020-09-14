import React from 'react';
import { ipcRenderer } from 'electron';
import { makeStyles, Theme } from '@material-ui/core/styles';

import GridOnIcon from '@material-ui/icons/GridOn';
import ListIcon from '@material-ui/icons/List';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function ExportTable({ table }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<ListIcon />}
        onClick={() => console.log('Export to CSV')}
      >
        Export to CSV
      </Button>
      <Button
        variant="contained"
        color="primary"
        startIcon={<GridOnIcon />}
        onClick={() => console.log('Export to Excel')}
      >
        Export to Excel
      </Button>
    </div>
  );
}
