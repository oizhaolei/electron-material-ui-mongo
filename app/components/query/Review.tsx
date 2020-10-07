import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

import MaterialTable from 'material-table';

import { mongo2MaterialType } from '../../utils/utils';


const DataTable = ({ columns, data }) => {
  return (
    <MaterialTable
      title="Data"
      columns={columns}
      data={data}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(1, 0),
  },
  total: {
    fontWeight: 700,
  },
  title: {
    marginTop: theme.spacing(2),
  },
}));

export default function Review({ dataState, onChange }) {
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const queryDataListener = (event, { data }) => {
      setLoading(false);
      onChange({
        data,
      });
    };
    ipcRenderer.on('query-data', queryDataListener);
    ipcRenderer.send('query-data', dataState.code);

    return () => {
      ipcRenderer.removeListener('query-data', queryDataListener);
    };
  }, []);

  return (
    <>
      {loading && <CircularProgress />}
      <List disablePadding>
        <ListItem className={classes.listItem}>
          <ListItemText primary="Name" />
          <Typography variant="query name" className={classes.total}>
            {dataState.query}
          </Typography>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary="Label" />
          <Typography variant="query query" className={classes.total}>
            {dataState.code}
          </Typography>
        </ListItem>
      </List>

      {dataState.data && dataState.data.length > 0 && (
        <DataTable
          columns={Object.keys(dataState.definition).map((k) => ({
            title: k,
            field: k,
            type: mongo2MaterialType(dataState.definition[k].type),
          }))}
          data={dataState.data}
        />
      )}
    </>
  );
}
