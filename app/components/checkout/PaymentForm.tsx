import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import SearchIcons from '../SearchIcons';

export default function PaymentForm() {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
    return (
    <>
      <Typography variant="h6" gutterBottom>
        Table Title, Icon
      </Typography>
      <Grid container spacing={3}>
      <Grid item xs={12}>
          <TextField
            id="title"
            name="title"
            label="Table Title"
            fullWidth
            value={tableTitle}
            onChange={(event) => setTableTitle(event.target.value)}
            onBlur={() => ipcRenderer.send('table-post', { table, doc: { title: tableTitle }})}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={handleClickOpen}
            startIcon={<Icon>{tableIcon || 'ac_unit'}</Icon>}
          >
            Change Icon...
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
            setTableIcon(icon);
            ipcRenderer.send('table-post', { table, doc: { icon }})
          }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
          </>
  );
}
