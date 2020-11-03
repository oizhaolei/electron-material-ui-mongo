import React, { useState, useEffect, useContext } from 'react';
import log from 'electron-log';
import Store from 'electron-store';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import FreeDataTable from '../../components/FreeDataTable';
import StoreContext from '../../store/StoreContext';

const store = new Store();

export default function QueryPage() {
  const { t } = useTranslation();
  const [{ query: dataState }, dispatch] = useContext(StoreContext);

  useEffect(() => {
    dispatch({
      type: 'QUERY_CHANGE',
      payload: {
        filter: store.get(`query.${dataState.name}.filter`, {}),
      },
    });
  }, [dataState.name]);

  return (
    <>
      <Paper square>
        <Typography variant="body1" gutterBottom>
          {dataState.memo}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={9}>
            {dataState.params &&
              dataState.params.length > 0 &&
              dataState.params.map((param) => (
                <TextField
                  key={param}
                  required
                  label={param}
                  variant="outlined"
                  value={dataState.filter[param] || ''}
                  onChange={(event) => {
                    dispatch({
                      type: 'QUERY_CHANGE',
                      payload: {
                        filter: {
                          ...dataState.filter,
                          [param]: event.target.value,
                        },
                      },
                    });
                  }}
                />
              ))}
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                ipcRenderer
                  .invoke('query-code', {
                    code: dataState.code,
                    filter: dataState.filter,
                  })
                  .then((data) => {
                    log.info(data);
                    dispatch({
                      type: 'QUERY_CHANGE',
                      payload: {
                        data,
                      },
                    });

                    store.set(
                      `query.${dataState.name}.filter`,
                      dataState.filter
                    );
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
              {t('search')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper square>
        <Grid container spacing={3}>
          {Object.keys(dataState.data).map((item) => (
            <FreeDataTable
              key={item}
              title={item}
              data={dataState.data[item]}
            />
          ))}
        </Grid>
      </Paper>
      <Typography color="error" variant="body1" gutterBottom>
        {dataState.error}
      </Typography>
    </>
  );
}
