import React, { useState, useEffect, useRef } from 'react';
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
  const [pageSize, setPageSize] = useState(
    store.get(`schema.${dataState.name}.pageSize`, 20)
  );

  const tableRef = useRef();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (tableRef) {
      tableRef.current.onQueryChange();
    }
  }, []);

  const columns = Object.keys(dataState.definition).map((k) => ({
    title: k,
    field: k,
    type: mongo2MaterialType(dataState.definition[k].type),
    headerStyle: {
      whiteSpace: 'nowrap',
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
    const results = ipcRenderer.sendSync('update', {
      name: dataState.name,
      filter: {
        _id: {
          $in: dataState.changeList.map((r) => r._id),
        },
      },
      doc: dataState.changes,
      sync: true,
    });
    console.log('results', results);
    dispatch({
      type: 'SCHEMA_DATA_CLEAR',
    })
    setDetailOpen(false);
  };
  const handleDetailClose = () => {
    dispatch({
      type: 'SCHEMA_DATA_CLEAR',
    })
    setDetailOpen(false);
  };
  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
    store.set(`schema.${dataState.name}.pageSize`, size);
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
        tableRef={tableRef}
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
              filter: {
                ...filter,
                ...query.filters.reduce((r, v) => {
                  r[v.column.field] = v.value;
                  return r;
                }, {}),
              },
              options,
              sync: true,
            });

            resolve({
            ...results,
            });
          })
        }
        onChangeRowsPerPage={handleChangeRowsPerPage}
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
              const results = ipcRenderer.sendSync('remove', {
                name: dataState.name,
                filter: {
                  _id: {
                    $in: rows.map((r) => r._id),
                  },
                },
                sync: true,
              });
              console.log(results);
            },
          },
        ]}
        editable={{
          onRowAdd: (newData) =>
            new Promise((resolve, reject) => {
              console.log('onRowAdd: ', newData);
              resolve();
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              console.log('onRowUpdate: ', newData, oldData);
              resolve();
            }),
          onRowDelete: (oldData) =>
            new Promise((resolve, reject) => {
              console.log('onRowDelete: ', oldData);
              resolve();
            }),
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
        message={t('deleting')}
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
