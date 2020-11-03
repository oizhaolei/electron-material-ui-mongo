import React, { useState, useContext } from 'react';
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import StoreContext from '../../store/StoreContext';

export default function SettingForm() {
  const { t } = useTranslation();
  const [{ query: dataState }, dispatch] = useContext(StoreContext);

  const [input, setInput] = useState(dataState.params.join());
  const [code, setCode] = useState(dataState.code);

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('query SettingForm demo')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Input"
            multiline
            fullWidth
            rows={6}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            variant="outlined"
            error={!!dataState.error}
            helperText={dataState.error}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            label="Code"
            multiline
            fullWidth
            rows={20}
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            variant="outlined"
            error={!!dataState.error}
            helperText={dataState.error}
          />
        </Grid>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            ipcRenderer
              .invoke('query-post', {
                name: pluralize(dataState.name),
                data: {
                  code,
                  params: [
                    ...new Set(
                      input
                        .split(/[\s-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/)
                        .filter(Boolean)
                    ),
                  ],
                },
              })
              .then((result) => {
                log.info('query-post:', result);
                dispatch({
                  type: 'QUERY_CHANGE',
                  payload: result,
                });
              })
              .catch((e) => {
                dispatch({
                  type: 'QUERY_CHANGE',
                  payload: {
                    error: e.toString(),
                  },
                });
              });
          }}
        >
          {t('save')}
        </Button>
      </Grid>
    </>
  );
}
