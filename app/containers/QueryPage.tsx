import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

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
  const { name } = useParams();
  const [query, setQuery] = useState({});

  useEffect(() => {
    const queryListener = (event, query) => {
      setQuery(query);
    };
    ipcRenderer.on('query', queryListener);
    ipcRenderer.send('query', name);
    return () => {
      ipcRenderer.removeListener('query', queryListener);
    };
  }, [name]);

  return (
    <GenericTemplate id={name}>
      <Paper square key={name}>
        {
          query.relations
          && query.relations.one
          && query.relations.one.table
          && (
            <ReadonlyDataTable
              schemaName={query.relations.one.table}
              dialogContent={({ list }) =>
                list.length > 0 && (
                  <ReadonlyDataTable
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
