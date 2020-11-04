import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import GenericTemplate from '../templates/GenericTemplate';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function SettingPage() {
  const classes = useStyles();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [uri, setUri] = useState('');

  useEffect(() => {
    ipcRenderer.invoke('uri').then((u) => {
      setUri(u);
    });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    ipcRenderer.invoke('uri', uri).then((u) => {
      setUri(u);
    });
    setOpen(false);
  };
  return (
    <GenericTemplate title={t('Setting')} id="setting">
      <div className={classes.root}>
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          {t('Mongo Uri')}
        </Button>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">MongoDb URI</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {text('change db need restart')}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="uri"
            label={t('Mongo Uri')}
            type="text"
            value={uri}
            onChange={(event) => setUri(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t('Cancel')}
          </Button>
          <Button onClick={handleSave} color="primary">
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </GenericTemplate>
  );
}
