import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import SearchIcons from './SearchIcons';

const useStyles = makeStyles((theme) => ({
  paper: {
    maxWidth: 800,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    alignItems: 'center',
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
}));

export default function SettingTable({ schemaName }) {
  const classes = useStyles();
  const { t } = useTranslation();

  const [label, setLabel] = useState(schemaName);
  const [icon, setIcon] = useState('');

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const schemaPostListener = (event, args) => {
      console.log('schema-post:', args);
    };
    ipcRenderer.on('schema-post', schemaPostListener);
    const schemaDeleteListener = (event, args) => {
      console.log('schema-delete:', args);
    };
    ipcRenderer.on('schema-delete', schemaDeleteListener);
    return () => {
      ipcRenderer.removeListener('schema-post', schemaPostListener);
      ipcRenderer.removeListener('schema-delete', schemaDeleteListener);
    };
  }, [schemaName]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Paper className={classes.paper} levation={0}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="label"
            name="label"
            label={t('Table Label')}
            fullWidth
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            onBlur={() =>
              ipcRenderer.send('schema-post', {
                name: schemaName,
                etc: {
                  label,
                },
              })
            }
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleClickOpen}
            startIcon={<Icon>{icon || 'ac_unit'}</Icon>}
          >
            {t('Change Icon...')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => ipcRenderer.send('schema-delete', {
              name: schemaName,
            })}
            startIcon={<DeleteForeverIcon />}
          >
            {t('Drop Table')}
          </Button>
        </Grid>
      </Grid>

      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Fill the form</DialogTitle>
        <DialogContent>
          <SearchIcons onChange={(icon) => {
            setIcon(icon);
            ipcRenderer.send('schema-post', {
              name: schemaName,
              etc: {
                icon,
              }
            });
          }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleClose} color="primary">
            {t('Ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
