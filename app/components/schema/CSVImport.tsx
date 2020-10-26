import React, { useState } from 'react';
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

const MATERIAL_DEFINITION = [
  {
    title: 'Field',
    field: 'field',
    editable: 'never',
  },
  {
    title: 'Type',
    field: 'type',
    lookup: {
      Number: 'Number',
      Boolean: 'Boolean',
      Date: 'Date',
      String: 'String',
    },
  },
];

const SchemaTable = ({ columns, data, dispatch }) => {
  return (
    <MaterialTable
      title="Schema"
      columns={columns}
      data={data}
      cellEditable={{
        onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
          return new Promise((resolve, reject) => {
            console.log('newValue: ', newValue, rowData, columnDef);
            dispatch({
              type: 'SCHEMA_WIZARD_SCHEMA_TYPE_CHANGE',
              payload: {
                field: rowData.field,
                type: newValue,
              },
            });
            resolve();
          });
        }
      }}
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

export default function CSVImport({ dataState, dispatch }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('schema CSVImport demo')}
        {t('schema CSVImport demo2')}
      </Typography>
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
        dropzoneText={t('Drag and drop an CSV here or click')}
        onChange={(files) => {
          if (files && files.length > 0) {
            setLoading(true);
            ipcRenderer
              .invoke('csv-read', files[0].path)
              .then(({ definition, data }) => {
                setLoading(false);
                dispatch({
                  type: 'SCHEMA_WIZARD_INIT',
                  payload: {
                    definition,
                    data,
                  },
                });
              });
          }
        }}
      />
      {dataState.definition && Object.keys(dataState.definition).length > 0 && (
        <SchemaTable
          columns={MATERIAL_DEFINITION}
          data={Object.keys(dataState.definition).map((k) => ({
            field: k,
            type: dataState.definition[k].type,
          }))}
          dispatch={dispatch}
        />
      )}

      {dataState.data && dataState.data.length > 0 && (
        <CSVDataTable
          columns={dataState.materialDefinition}
          data={dataState.data}
        />
      )}
    </>
  );
}
