import React, { useState } from 'react';
import log from 'electron-log';
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
    editable: 'never',
    lookup: {
      Number: 'Number',
      Boolean: 'Boolean',
      Date: 'Date',
      String: 'String',
    },
  },
];

const DefinitionTable = ({ columns, data, dispatch }) => {
  const { t } = useTranslation();

  return (
    <MaterialTable
      title={t('schema')}
      columns={columns}
      data={data}
      options={{
        exportButton: true,
        exportAllData: true,
        search: false,
        paging: false,
      }}
      cellEditable={{
        onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
          return new Promise((resolve) => {
            log.info('newValue: ', newValue, rowData, columnDef);
            dispatch({
              type: 'SCHEMA_WIZARD_SCHEMA_TYPE_CHANGE',
              payload: {
                field: rowData.field,
                type: newValue,
              },
            });
            resolve();
          });
        },
      }}
    />
  );
};

const CSVDataTable = ({ columns, data }) => {
  const { t } = useTranslation();

  return (
    <MaterialTable
      options={{
        exportButton: true,
        exportAllData: true,
        search: false,
      }}
      title={t('data')}
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const classes = useStyles();

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('schema csvimport demo')}
        {t('schema csvimport demo2')}
      </Typography>
      {isLoading && <CircularProgress />}
      <List disablePadding>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('name')} />
          <Typography variant="subtitle1" className={classes.total}>
            {dataState.name}
          </Typography>
        </ListItem>
      </List>
      <DropzoneArea
        acceptedFiles={[
          '.csv',
          'text/csv',
          'application/vnd.ms-excel',
          'application/csv',
          'text/x-csv',
          'application/x-csv',
          'text/comma-separated-values',
          'text/x-comma-separated-values',
        ]}
        maxFileSize={50000000}
        dropzoneText={t('drag and drop an csv here or click')}
        onChange={(files) => {
          if (files && files.length > 0) {
            setIsLoading(true);
            ipcRenderer
              .invoke('csv-read', files[0].path)
              .then(({ definition, data }) => {
                setIsLoading(false);
                dispatch({
                  type: 'SCHEMA_WIZARD_INIT',
                  payload: {
                    definition,
                    data,
                  },
                });
                setError('');
              })
              .catch((e) => {
                setError(e.toString());
              });
          }
        }}
      />
      {dataState.definition && Object.keys(dataState.definition).length > 0 && (
        <DefinitionTable
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
      <Typography color="error" variant="body1" gutterBottom>
        {error}
      </Typography>
    </>
  );
}
