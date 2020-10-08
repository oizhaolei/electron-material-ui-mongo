import React, { useState, useEffect } from 'react';
import { useRouteMatch } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import GenericTemplate from '../templates/GenericTemplate';
import DataTable from '../components/DataTable';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function QueryPage() {
  const classes = useStyles();
  const match = useRouteMatch();
  const { name } = match.params;
  const [query, setQuery] = useState([]);

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
    <GenericTemplate title={name} id={name}>
      <Paper square key={name}>
        {
          query.relations
          && query.relations.one
          && query.relations.one.table
          && (
            <DataTable
              schemaName={query.relations.one.table}
              dialogContent={({ list }) => (
                <DataTable
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
