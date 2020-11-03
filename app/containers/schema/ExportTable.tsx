import React, { useState } from 'react';
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListIcon from '@material-ui/icons/List';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function ExportTable({ dataState }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [error, setError] = useState();
  const [text, setText] = useState('');

  return (
    <div className={classes.root}>
      <Typography variant="body2" gutterBottom>
        {t('ExportTable demo')}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<ListIcon />}
        onClick={() => {
          ipcRenderer
            .invoke('export-csv', {
              name: dataState.name,
            })
            .then((result) => {
              log.info(result);
              setText(result);
              setError('');
            })
            .catch((e) => {
              setText('');
              setError(e.toString());
            });
        }}
      >
        {t('Export to CSV')}
      </Button>
      <Typography variant="body2" gutterBottom>
        {text}
      </Typography>
      <Typography color="error" variant="body1" gutterBottom>
        {error}
      </Typography>
    </div>
  );
}
