import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import FreeDataTable from '../FreeDataTable';

export default function CodeForm({ dataState, dispatch }) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const [errorCode, setErrorCode] = useState(false);
  const [input, setInput] = React.useState('');
  const [params, setParams] = React.useState([]);
  const [filter, setFilter] = React.useState({});
  const [code, setCode] = React.useState('');
  const [data, setData] = React.useState({});

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('query CodeForm demo')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField
            label="Input"
            multiline
            rows={6}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              try {
                setParams([
                  ...new Set(
                    input
                      .split(/[\s-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/)
                      .filter(Boolean)
                  ),
                ]);
                setError('');
              } catch (e) {
                console.log('e:', e);
                setParams([]);
                setError(e.toString());
              }
            }}
            variant="outlined"
            error={!!error}
            helperText={error}
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
            label="Code"
            multiline
            rows={10}
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
