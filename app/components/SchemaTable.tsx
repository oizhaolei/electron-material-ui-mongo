import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MaterialTable from 'material-table';
import SaveIcon from '@material-ui/icons/Save';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

const columns = [
  {
    field: 'field',
    title: 'Field',
  },
  {
    field: 'type',
    title: 'Type',
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

  const [changed, setChanged] = useState(false);
  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  const handleSaveSchema = () => {
    const newSchema = ipcRenderer.sendSync('schema-post', {
      name: dataState.name,
      definition: dataState.definition,
      sync: true,
    });
    dispatch({
      type: 'SCHEMA_CHANGE',
      payload: newSchema,
    });
  };

  const handleDropSchema = () => {
    const results = ipcRenderer.sendSync('schema-drop', {
      name: dataState.name,
      sync: true,
    });
    console.log('schema-drop:', results);
    history.replace('/');
};

  return (
    <>
      <Button
        variant="contained"
        startIcon={<DeleteForeverIcon />}
        color="secondary"
        onClick={handleDropSchema}
      >
        {t('Drop Table')}
      </Button>

      {changed && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSchema}
        >
          {t('Save')}
        </Button>
      )}
      <MaterialTable
        title={dataState.name}
        options={{
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
        }}
        columns={columns}
        data={data}
        editable={{
          onRowAdd: (newData) =>
            new Promise((resolve, reject) => {
              console.log('newData:', newData);
              setChanged(true);
              dispatch({
                type: 'COLUMN_ADDED',
                payload: {
                  newData,
                },
              });
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setChanged(true);
              dispatch({
                type: 'COLUMN_UPDATED',
                payload: {
                  newData,
                  oldData,
                },
              });
              resolve();
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              setChanged(true);
              dispatch({
                type: 'COLUMN_DELETED',
                payload: {
                  oldData,
                },
              });
              resolve();
            }),
        }}
      />

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={t('Saving...')}
      />
    </>
  );
}
