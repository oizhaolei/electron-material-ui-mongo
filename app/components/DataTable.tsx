import React, { useState } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import Store from 'electron-store';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import MaterialTable from 'material-table';

import DetailForm from './DetailForm';
import { mongo2MaterialType } from '../utils/utils';

const store = new Store();

export default function DataTable({
  dataState,
  dispatch,
  filter = {},
  ...otherProps
}) {
  const { t } = useTranslation();
  const [pageSize, setPageSize] = useState(store.get('pageSize', 20));

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const columns = Object.keys(dataState.definition).map((k) => ({
    title: k,
    field: k,
    type: mongo2MaterialType(dataState.definition[k].type),
    headerStyle: {
      whiteSpace: "nowrap",
    },
    lookup: dataState.suggests[k]
      ? dataState.suggests[k].reduce((r, v) => (r[v] = v, r), {})
      : undefined,
  }));

  const handleClickDetailOpen = () => {
    setDetailOpen(true);
  };

  const handleDetailSave = () => {
    //
    console.log('dataState.changeList', dataState.changeList);
    console.log('dataState.changes', dataState.changes);
    const results = ipcRenderer.sendSync('update', {
      name: dataState.name,
      filter: {
        _id: {
          $in: dataState.changeList.map((r) => r._id),
        }
      },
      doc: dataState.changes,
      sync: true,
    });
    console.log('results', results);
    setDetailOpen(false);
  };
  const handleDetailClose = () => {
    setDetailOpen(false);
  };
  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
  };

  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClick = () => {
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <>
      <MaterialTable
        title={dataState.name}
        options={{
          pageSize,
          selection: true,
          filtering: true,
          pageSizeOptions: [20, 50, 100],
        }}
        columns={columns}
        data={(query) =>
          new Promise((resolve, reject) => {
            const options = {
              limit: query.pageSize,
              skip: query.page * query.pageSize,
              page: query.page,
            };
            const results = ipcRenderer.sendSync('find', {
              name: dataState.name,
              filter,
              options,
              sync: true,
            });

            resolve({
            ...results,
            });
          })
        }
        cellEditable={{
          onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
            return new Promise((resolve, reject) => {
              console.log('newValue: ' + newValue);
              setTimeout(resolve, 1000);
            });
          },
        }}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onSelectionChange={(rows) => {
          if (rows.length === 1 && selected.length === 0) {
            setDetailOpen(true);
          }
          console.log('You selected ' + rows.length + ' rows');
          setSelected(rows);
        }}
        actions={[
          {
            icon: 'add',
            tooltip: 'Add',
            isFreeAction: true,
            onClick: () => {
              setSelected([]);
              handleClickDetailOpen();
            },
          },
          {
            tooltip: 'Edit Selected Rows',
            icon: 'edit',
            onClick: (event, rows) => {
              console.log('You want to edit ' + rows.length + ' rows');
              setSelected(rows);
              handleClickDetailOpen();
            },
          },
          {
            tooltip: 'Remove Selected Rows',
            icon: 'delete',
            onClick: (event, rows) => {
              console.log('You want to delete ' + rows.length + ' rows');
              setSelected(rows);
              handleSnackbarClick();
            },
          },
        ]}
        editable={{
          onRowAdd: (newData) => console.log('onRowAdd: ', newData),
          onRowUpdate: (newData, oldData) =>console.log('onRowUpdate: ', newData, oldData),
          onRowDelete: (oldData) => console.log('onRowDelete: ', oldData),
        }}
        {...otherProps}
      />
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={detailOpen}
        onClose={handleDetailClose}
      >
        <DialogTitle>Fill the form</DialogTitle>
        <DialogContent>
          <DetailForm
            definition={dataState.definition}
            suggests={dataState.suggests}
            list={selected}
            dispatch={dispatch}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleDetailSave} color="primary">
            {t('Ok')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={t('Deleting...')}
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
