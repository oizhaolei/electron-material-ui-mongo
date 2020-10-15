import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

import { DropzoneArea } from 'material-ui-dropzone';
import MaterialTable from 'material-table';

import { mongo2MaterialType } from '../../utils/utils';

const SchemaTable = ({ data }) => {
  const columns = [
    { title: 'Field', field: 'field' },
    { title: 'Type', field: 'type' },
  ];
  return (
    <MaterialTable
      title="Schema"
      columns={columns}
      data={data}
    />
  );
};

const CSVDataTable = ({ columns, data }) => {
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  return (
    <>
      {loading && <CircularProgress />}
      <List disablePadding>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('Name')} />
          <Typography variant="subtitle1" className={classes.total}>
            {dataState.name}
          </Typography>
        </ListItem>
      </List>
      <DropzoneArea
        acceptedFiles={['text/csv']}
        dropzoneText={'Drag and drop an CSV here or click'}
        onChange={(files) => {
          if (files && files.length > 0) {
            setLoading(true);
            const { definition, data } = ipcRenderer.sendSync('csv-read', {
              file: files[0].path,
              sync: true,
            });
            setLoading(false);
            onChange({
              definition,
              data,
            });
          }
        }}
      />
      {dataState.definition && Object.keys(dataState.definition).length > 0 && (
        <SchemaTable data={Object.keys(dataState.definition).map((k) => ({
            title: k,
            field: k,
            type: dataState.definition[k].type,
          }))}
        />
      )}

      {dataState.data && dataState.data.length > 0 && (
        <CSVDataTable
          columns={Object.keys(dataState.definition).map((k) => ({
            title: k,
            field: k,
            type: mongo2MaterialType(dataState.definition[k].type),
            headerStyle: {
              whiteSpace: 'nowrap',
            },
          }))}
          data={dataState.data}
        />
      )}
    </>
  );
}
