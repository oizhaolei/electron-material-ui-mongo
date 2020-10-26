import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import pluralize  from 'pluralize';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

export default function NameForm({ dataState, dispatch }) {
  const { t } = useTranslation();

  const [name, setName] = useState(dataState.name);
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    ipcRenderer
      .invoke('queries')
      .then((qs) => {
        setQueries(qs.map((s) => pluralize.singular(s.name.toLowerCase())));
      });
  }, []);

  const handleChange = (v) => {
    setName(v);

    const input = pluralize.singular(v.toLowerCase());
    const err = queries.includes(input);
    setError(err);
    setHelperText(err && 'duplicated name');
    dispatch({
      type: 'QUERY_DATA_CHANGE',
      payload: {
        name: input,
        error: err,
      },
    });
  };
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('Query Name')}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t('query NameForm demo')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="name"
            name="name"
            label={t('Query Name')}
            fullWidth
            autoComplete="input unique query please"
            value={name}
            onChange={(event) => handleChange(event.target.value)}
            error={error}
            helperText={helperText}
          />
        </Grid>
      </Grid>
    </>
  );
}
