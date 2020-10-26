import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import MaterialTable from 'material-table';
import TextField from "@material-ui/core/TextField";

import GenericTemplate from '../templates/GenericTemplate';

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
  const [filter, setFilter] = React.useState({});
  const [data, setData] = React.useState({});

  useEffect(() => {
    ipcRenderer
      .invoke('query', {
        name,
      })
      .then((query) => {
        setQuery(query);
      });
  }, [name]);

  return (
    <GenericTemplate id={name}>
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
      <Grid container spacing={3}>
        <Grid item xs={10}>
          {
            query.params && query.params.length > 0 && query.params.map((param) => {
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
            })
          }
        </Grid>
        <Grid item xs={2}>
          <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                ipcRenderer.invoke('query-code', {
                  code: query.code,
                  filter,
                }).then((data) => {
                  console.log(data);
                  setData(data);
                }).catch((e) => {
                  setError(e.toString());
                });
              }}
            >
              {t('search')}
            </Button>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {
          data && Object.keys(data).map((entity) => (
            <MaterialTable
              key={entity}
              title={entity}
              columns={
                data[entity].length > 0
                  ? Object.keys(data[entity][0]).map((col) => ({
                      key: col,
                      field: col,
                      title: col,
                    }))
                  : []
                }
              data={data[entity]}
              options={{
                exportButton: true,
                search: false,
              }}
            />
          ))
        }
      </Grid>
      <Typography variant="body1" gutterBottom>
          {error}
        </Typography>
    </GenericTemplate>
  );
}
