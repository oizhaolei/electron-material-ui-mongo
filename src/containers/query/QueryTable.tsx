import React, { useState, useEffect, useContext } from 'react';
import log from 'electron-log';
import Store from 'electron-store';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

import FreeDataTable from '../../components/FreeDataTable';
import StoreContext from '../../store/StoreContext';

const store = new Store();
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

export default function QueryPage() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [{ query: dataState }, dispatch] = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'QUERY_CHANGE',
      payload: {
        filter: store.get(`query.${dataState.name}.filter`, {}),
      },
    });
  }, [dataState.name]);

  const handleSnackClose = (event, reason) => {
    setSnackOpen(false);
  };

  return (
    <>
      <Paper square>
        <Typography variant="body2" gutterBottom>
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
            {isLoading && <CircularProgress />}
          </Grid>
          <Grid item xs={3} className={classes.root}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setIsLoading(true);
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
                        error: false,
                      },
                    });

                    store.set(
                      `query.${dataState.name}.filter`,
                      dataState.filter
                    );

                    setIsLoading(false);
                  })
                  .catch((e) => {
                    dispatch({
                      type: 'QUERY_CHANGE',
                      payload: {
                        error: e.toString(),
                      },
                    });
                    setIsLoading(false);
                  });
              }}
            >
              {t('search')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setIsLoading(true);
                ipcRenderer
                  .invoke('query-code-save', {
                    code: dataState.code,
                    filter: dataState.filter,
                  })
                  .then((data) => {
                    log.info(data);

                    setIsLoading(false);
                    setSnackOpen(true);
                  })
                  .catch((e) => {
                    dispatch({
                      type: 'QUERY_CHANGE',
                      payload: {
                        error: e.toString(),
                      },
                    });
                    setIsLoading(false);
                  });
              }}
            >
              {t('export')}
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
      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={handleSnackClose}
      >
        <Alert onClose={handleSnackClose} severity="success">
          {t('query csv export')}
        </Alert>
      </Snackbar>
    </>
  );
}
