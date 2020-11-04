import React, { useState, useMemo } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import FreeDataTable from '../FreeDataTable';

export default function CodeForm({ dataState, dispatch }) {
  const { t } = useTranslation();
  const [errorCode, setErrorCode] = useState(false);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState({});
  const [code, setCode] = useState('');
  const [data, setData] = useState({});

  const params = useMemo(() => {
    return [
      ...new Set(
        input.split(/[\s-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/).filter(Boolean)
      ),
    ];
  }, [input]);

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('query CodeForm demo')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField
            label={t('Input')}
            multiline
            fullWidth
            rows={6}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6}>
          {params &&
            params.length > 0 &&
            params.map((param) => (
              <TextField
                key={param}
                label={param}
                variant="outlined"
                value={filter[param] || ''}
                onChange={(event) => {
                  setFilter({
                    ...filter,
                    [param]: event.target.value,
                  });
                }}
              />
            ))}
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={10}>
          <TextField
            label={t('Code')}
            multiline
            fullWidth
            rows={20}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            variant="outlined"
            error={!!errorCode}
            helperText={errorCode}
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              ipcRenderer
                .invoke('query-code', {
                  code,
                  filter,
                })
                .then((data) => {
                  setData(data);
                  dispatch({
                    type: 'QUERY_WIZARD_DEFINITION_CHANGE',
                    payload: {
                      params,
                      code,
                      error: false,
                      tested: true,
                    },
                  });
                  setErrorCode('');
                })
                .catch((e) => {
                  console.log('e:', e);
                  setErrorCode(e.toString());
                });
            }}
          >
            {t('test')}
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {Object.keys(data).map((item) => (
          <FreeDataTable key={item} title={item} data={data[item]} />
        ))}
      </Grid>
    </>
  );
}
