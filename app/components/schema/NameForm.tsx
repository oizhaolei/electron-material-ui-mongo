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
  const [schemaNames, setSchemaNames] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    ipcRenderer
      .invoke('schemas')
      .then((schemas) => {
        const names = schemas.map((s) => pluralize(s.name.toLowerCase()));
        setSchemaNames(names);
      });
  }, []);

  const handleChange = (v) => {
    setName(v);

    const err = schemaNames.includes(pluralize(v.toLowerCase()));
    setError(err);
    setHelperText(err && 'duplicated name');
    dispatch({
      type: 'SCHEMA_WIZARD_INIT',
      payload: {
        name: v,
        error: err,
      },
    });
  };
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {t('Table Name')}
      </Typography>
      <Typography variant="body2" gutterBottom>
        テーブル名はユニックが必要、既存のテーブルと重複しないでください。
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
            onChange={(event) => handleChange(event.target.value)}
            error={error}
            helperText={helperText}
          />
        </Grid>
      </Grid>
    </>
  );
}
