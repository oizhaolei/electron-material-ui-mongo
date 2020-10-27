import React, { useState, useEffect } from 'react';
import Store from 'electron-store';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import TextField from '@material-ui/core/TextField';

import GenericTemplate from '../templates/GenericTemplate';
import FreeDataTable from '../components/FreeDataTable';

const store = new Store();
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function QueryPage() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const { name } = useParams();
  const [query, setQuery] = useState({});
  const [error, setError] = useState();
  const [filter, setFilter] = useState(store.get(`query.${name}.filter`, {}));
  const [data, setData] = useState({});

  useEffect(() => {
    ipcRenderer
      .invoke('query', {
        name,
      })
      .then((q) => {
        setQuery(q);
      });
  }, [name]);

  return (
    <GenericTemplate id={name}>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          {query.params &&
            query.params.length > 0 &&
            query.params.map((param) => (
              <TextField
                key={param}
                label={param}
                variant="outlined"
                value={filter[param]}
                onChange={(event) => {
                  setFilter({
                    ...filter,
                    [param]: event.target.value,
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
                  code: query.code,
                  filter,
                })
                .then((data) => {
                  console.log(data);
                  setData(data);

                  store.set(`query.${name}.filter`, filter);
                })
                .catch((e) => {
                  setError(e.toString());
                });
            }}
          >
            {t('search')}
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {Object.keys(data).map((item) => (
          <FreeDataTable key={item} title={item} data={data[item]} />
        ))}
      </Grid>
      <Typography variant="body1" gutterBottom>
        {error}
      </Typography>
      <Button
        variant="contained"
        startIcon={<DeleteForeverIcon />}
        color="secondary"
        onClick={() => {
          ipcRenderer
            .invoke('query-delete', {
              name,
            })
            .then((results) => {
              console.log('query-delete:', results);
              history.replace('/');
            });
        }}
      >
        {t('Drop Query')}
      </Button>
    </GenericTemplate>
  );
}
