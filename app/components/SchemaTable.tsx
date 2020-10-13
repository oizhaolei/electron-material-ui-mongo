import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MaterialTable from 'material-table';
import SaveIcon from '@material-ui/icons/Save';

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
export default function SchemaTable({ dataState, dispatch, handleSaveSchema }) {
  const { t } = useTranslation();
  console.log('dataState.definition:', dataState.definition);
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

  return (
    <>
      {changed && (
        <Button
          variant="contained"
          color="secondary"
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
        cellEditable={{
          onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
            return new Promise((resolve, reject) => {
              console.log('newValue: ' + newValue);
              setTimeout(resolve, 1000);
            });
          },
        }}
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
        action={
          <Button
            color="secondary"
            size="small"
            onClick={handleSnackbarClose}
          >
            {t('UNDO')}
          </Button>
        }
      />
    </>
  );
}
