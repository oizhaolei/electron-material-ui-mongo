import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useParams, useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

import GenericTemplate from '../templates/GenericTemplate';
import ReadonlyDataTable from '../components/ReadonlyDataTable';

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
      <Paper square key={name}>
        {
          query.relations
          && query.relations.one
          && query.relations.one.table
          && (
            <ReadonlyDataTable
              name={name}
              schemaName={query.relations.one.table}
              dialogContent={({ list }) =>
                list.length > 0 && (
                  <ReadonlyDataTable
                    name={name}
                    schemaName={query.relations.many.table}
                    filter={{
                      [query.relations.many.field]: list[0][query.relations.one.field],
                    }}
                  />
                )}
            />
          )
        }
      </Paper>
    </GenericTemplate>
  );
}
