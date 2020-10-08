import React from 'react';
import { ipcRenderer } from 'electron';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { DropzoneArea } from 'material-ui-dropzone';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function ImportTable({ schemaName }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <DropzoneArea
        acceptedFiles={['text/csv']}
        dropzoneText={'Drag and drop an CSV here or click'}
        onChange={(files) => console.log('Files:', files)}
      />
    </div>
  );
}
