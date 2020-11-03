import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

export default function NameForm({ dataState, dispatch }) {
  const { t } = useTranslation();

  const [name, setName] = useState(dataState.name);
  const [memo, setMemo] = useState(dataState.name);
  const [queryNames, setQuerynames] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    ipcRenderer.invoke('queries').then((qs) => {
      setQuerynames(qs.map((s) => pluralize(s.name.toLowerCase())));
    });
  }, []);

  const handleNameChange = (v) => {
    setName(v);

    const plural = pluralize(v.toLowerCase());
    const err = queryNames.includes(plural);
    setError(err);
    setHelperText(err && 'duplicated name');
    dispatch({
      type: 'QUERY_WIZARD_DEFINITION_CHANGE',
      payload: {
        name: plural,
        error: err,
      },
    });
  };

  const handleMemoChange = (v) => {
    setMemo(v);
    dispatch({
      type: 'QUERY_WIZARD_DEFINITION_CHANGE',
      payload: {
        memo: v,
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
            onChange={(event) => handleNameChange(event.target.value)}
            error={error}
            helperText={helperText}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="memo"
            name="memo"
            label={t('Memo')}
            fullWidth
            autoComplete="memo"
            value={memo}
            onChange={(event) => handleMemoChange(event.target.value)}
          />
        </Grid>
      </Grid>
    </>
  );
}
