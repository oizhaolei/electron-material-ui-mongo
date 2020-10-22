import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import StorageIcon from '@material-ui/icons/Storage';
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
  const [msg, setMsg] = useState('');

  return (
    <div className={classes.root}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<ListIcon />}
        onClick={() => {
          ipcRenderer.invoke('export-csv', {
            name: dataState.name,
          }).then((result) => {
            console.log(result);
            setMsg(result);
          });
        }}
      >
        {t('Export to CSV')}
      </Button>
      <Typography variant="body1" gutterBottom>
        {msg}
      </Typography>
    </div>
  );
}
