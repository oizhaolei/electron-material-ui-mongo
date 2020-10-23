import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import MaterialTable from 'material-table';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};


const columns = [
  {
    title: 'Field',
    field: 'field',
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
export default function SchemaTable({ dataState, dispatch }) {
  const { t } = useTranslation();
  const history = useHistory();

  const data = Object.keys(dataState.definition).map((k) => ({
    field: k,
    type: dataState.definition[k].type,
  }));

  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  const saveSchemaDefinition = (definition) => {
    ipcRenderer
      .invoke('schema-post', {
        name: dataState.name,
        definition,
      })
      .then((newSchema) => {
        dispatch({
          type: 'SCHEMA_INIT',
          payload: newSchema,
        });

        setSnackbarOpen(true);
      });
  };

  const handleDropSchema = () => {
    console.log('dataState:', dataState);
    ipcRenderer
      .invoke('schema-drop', {
        name: dataState.name,
      })
      .then((results) => {
        console.log('schema-drop:', results);
        history.replace('/');
      });
};

  return (
    <>
      <Typography variant="body2" gutterBottom>
        テーブル構造の追加、削除ができます。
      </Typography>
      <Button
        variant="contained"
        startIcon={<DeleteForeverIcon />}
        color="secondary"
        onClick={handleDropSchema}
      >
        {t('Drop Table')}
      </Button>

      <MaterialTable
        title={dataState.name}
        options={{
          search: false,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
        }}
        columns={columns}
        data={data}
        editable={{
          onRowAdd: (newData) =>
            new Promise((resolve, reject) => {
              console.log('newData:', newData);
              const definition = {
                ...dataState.definition,
                [newData.field]: {
                  type: newData.type,
                },
              };
              saveSchemaDefinition(definition);

              resolve();
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              const definition = {
                ...dataState.definition,
              };
              delete definition[oldData.field];
              saveSchemaDefinition(definition);

              resolve();
            }),
        }}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {t('Saved')}
        </Alert>
      </Snackbar>
    </>
  );
}
