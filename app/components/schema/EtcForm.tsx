import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import SearchIcons from '../SearchIcons';

export default function EtcForm({ dataState, onChange }) {
  const { t } = useTranslation();
  const [label, setLabel] = useState(dataState.label);
  const [icon, setIcon] = useState(dataState.icon);

  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLabelChange = (v) => {
    setLabel(v);
    onChange({
      label: v,
    });
  };

  const handleIconChange = (v) => {
    setIcon(v);
    onChange({
      icon: v,
    });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
      {t('Table Label, Icon')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            id="label"
            name="label"
            label={t('Table Label')}
            fullWidth
            value={label}
            onChange={(event) => handleLabelChange(event.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={handleClickOpen}
            startIcon={<Icon>{icon}</Icon>}
          >
            {t('Change Icon...')}
          </Button>
        </Grid>
      </Grid>

      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{t('Fill the form')}</DialogTitle>
        <DialogContent>
          <SearchIcons onChange={handleIconChange} />
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
    </>
  );
}
