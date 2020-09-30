import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import pluralize  from 'pluralize';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

export default function NameForm({ dataState, onChange }) {
  const [table, setTable] = useState(dataState.table);

  const [tables, setTables] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    const schemasListener = (event, arg) => {
      setTables(arg.map((s) => pluralize(s.table.toLowerCase())));
    };
    ipcRenderer.on('schemas', schemasListener);
    ipcRenderer.send('schemas');

    return () => {
      ipcRenderer.removeListener('schemas', schemasListener);
    };
  }, []);

  const handleChange = (v) => {
    setTable(v);

    const err = tables.includes(pluralize(v.toLowerCase()));
    setError(err);
    setHelperText(err && 'duplicated name');
    onChange({
      table: v,
      error: err,
    });
  };
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Table Name
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="table"
            name="table"
            label="Table Name"
            fullWidth
            autoComplete="input unique table please"
            value={table}
            onChange={(event) => handleChange(event.target.value)}
            error={error}
            helperText={helperText}
          />
        </Grid>
      </Grid>
    </>
  );
}
