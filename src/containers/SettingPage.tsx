import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ColorTool from '../components/color/ColorTool';

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

  const onColorChange = (paletteColors) => {
    ipcRenderer.send('paletteColors', paletteColors);
  };

  return (
    <GenericTemplate title={t('setting')} id="setting">
      <Paper square className={classes.root}>
        <ColorTool onChange={onColorChange} />
      </Paper>
      <Paper square className={classes.root}>
        <Button variant="contained" color="secondary" onClick={handleClickOpen}>
          {t('mongo uri')}
        </Button>
      </Paper>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">MongoDb URI</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('change db need restart')}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="uri"
            label={t('mongo uri')}
            type="text"
            value={uri}
            onChange={(event) => setUri(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} color="primary">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </GenericTemplate>
  );
}
