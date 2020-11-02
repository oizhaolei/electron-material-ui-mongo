import React, { useState, useEffect } from 'react';
import log from 'electron-log';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
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

const code = `
(({ models, filter, log, callback }) => {
  (async () => {
    log.info('vm start.', filter);
    try {
      const patient = await models['patient'].findOne({
        '患者番号': filter['患者番号'],
      }).lean();
      const diseases = await models['disease'].find({
        '患者番号': filter['患者番号'],
        '採取日': {
          $lte: filter['採取日']
        },
      }).lean();
      callback(false, {
        patient: patient ? [patient] : [],
        diseases,
      });
    } catch (e) {
      log.info('e:', e);
      callback(e);
    }
    log.info('vm end');
  })();
})
`;

// INPUT: 患者番号, 日付, before/after
//
// OUTPUT:
//    patients: one row
//    disease: multi rows

export default function SettingPage() {
  const classes = useStyles();
  const [text, setText] = useState();
  const [error, setError] = useState();
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
    <GenericTemplate title="Setting" id="setting">
      <div className={classes.root}>
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
          Mongo Uri
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            ipcRenderer
              .invoke('query-code', {
                code,
                filter: {
                  患者番号: '04581799',
                  採取日: '2018/03/10',
                },
              })
              .then((data) => {
                log.info(data);
                setText(JSON.stringify(data));
                setError('');
              })
              .catch((e) => {
                setText('');
                setError(e.toString());
              });
          }}
        >
          Run Sample Query Code
        </Button>
        <Typography variant="body2" gutterBottom>
          {text}
        </Typography>
        <Typography color="error" variant="body1" gutterBottom>
          {error}
        </Typography>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">MongoDb URI</DialogTitle>
        <DialogContent>
          <DialogContentText>
            新URIに切り替えなら、アプリを再起動が必要です.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="uri"
            label="Mongo Uri"
            type="text"
            value={uri}
            onChange={(event) => setUri(event.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </GenericTemplate>
  );
}
