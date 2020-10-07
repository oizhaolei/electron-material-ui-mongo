import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import pluralize  from 'pluralize';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

export default function NameForm({ dataState, onChange }) {
  const [query, setTable] = useState(dataState.query);

  const [queries, setQueries] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    const queriesListener = (event, arg) => {
      setQueries(arg.map((s) => pluralize(s.query.toLowerCase())));
    };
    ipcRenderer.on('queries', queriesListener);
    ipcRenderer.send('queries');

    return () => {
      ipcRenderer.removeListener('queries', queriesListener);
    };
  }, []);

  const handleChange = (v) => {
    setTable(v);

    const err = queries.includes(pluralize(v.toLowerCase()));
    setError(err);
    setHelperText(err && 'duplicated name');
    onChange({
      query: v,
      error: err,
    });
  };
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Query Name
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="query"
            name="query"
            label="Query Name"
            fullWidth
            autoComplete="input unique query please"
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            error={error}
            helperText={helperText}
          />
        </Grid>
      </Grid>
    </>
  );
}
