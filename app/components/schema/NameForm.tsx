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
  const [schemaNames, setSchemaNames] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    ipcRenderer.invoke('schemas').then((ss) => {
      setSchemaNames(ss.map((s) => pluralize.singular(s.name.toLowerCase())));
    });
  }, []);

  const handleNameChange = (v) => {
    setName(v);

    const singular = pluralize.singular(v.toLowerCase());
    const err = schemaNames.includes(singular);
    setError(err);
    setHelperText(err && 'duplicated name');
    dispatch({
      type: 'SCHEMA_WIZARD_INIT',
      payload: {
        name: singular,
        error: err,
      },
    });
  };

  const handleMemoChange = (v) => {
    setMemo(v);
    dispatch({
      type: 'SCHEMA_WIZARD_INIT',
      payload: {
        memo: v,
      },
    });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('Table Name')}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {t('schema NameForm demo')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="name"
            name="name"
            label={t('Table Name')}
            fullWidth
            autoComplete="input unique table please"
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
