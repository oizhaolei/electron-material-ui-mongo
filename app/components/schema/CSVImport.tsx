import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import CircularProgress from '@material-ui/core/CircularProgress';

import { DropzoneArea } from 'material-ui-dropzone';
import MaterialTable from 'material-table';

const SchemaTable = ({ data }) => {
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'Field', field: 'field' },
  ];
  return (
    <MaterialTable
      title="Schema"
      columns={columns}
      data={data}
    />
  );
};

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

export default function CSVImport({ dataState, onChange }) {
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const csvReadListener = (event, { definition, data }) => {
      setLoading(false);
      onChange({
        definition,
        data,
      });
    };
    ipcRenderer.on('csv-read', csvReadListener);

    return () => {
      ipcRenderer.removeListener('csv-read', csvReadListener);
    };
  }, []);

  return (
    <>
      {loading && <CircularProgress />}
      <Typography variant="h6" gutterBottom>
        <Icon>{dataState.icon}</Icon>
      </Typography>
      <List disablePadding>
        <ListItem className={classes.listItem}>
          <ListItemText primary="Name" />
          <Typography variant="table name" className={classes.total}>
            {dataState.table}
          </Typography>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary="Label" />
          <Typography variant="table table" className={classes.total}>
          {dataState.label}
          </Typography>
        </ListItem>
      </List>
      <DropzoneArea
        acceptedFiles={['text/csv']}
        dropzoneText={'Drag and drop an CSV here or click'}
        onChange={(files) => {
          if (files && files.length > 0) {
            setLoading(true);
            ipcRenderer.send('csv-read', files[0].path);
          }
        }}
      />
      {dataState.definition && Object.keys(dataState.definition).length > 0 && (
        <SchemaTable data={Object.keys(dataState.definition).map((k) => ({
            title: k,
            field: k,
          }))} />
      )}

      {dataState.data && dataState.data.length > 0 && (
        <DataTable
          columns={Object.keys(dataState.definition).map((k) => ({
            title: k,
            field: k,
          }))}
          data={dataState.data}
        />
      )}
    </>
  );
}
