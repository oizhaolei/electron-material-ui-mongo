import React, { useState, useRef } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import Store from 'electron-store';

import Button from '@material-ui/core/Button';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import MaterialTable from 'material-table';

import DetailForm from './DetailForm';

const store = new Store();

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

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
  const [isLoading, setIsLoading] = useState(false);

  const handleClickDetailOpen = () => {
    setDetailOpen(true);
  };

  const handleDetailSave = () => {
    //
    if (dataState.changeList.length > 0) {
      ipcRenderer.invoke('update', {
        name: dataState.name,
        filter: {
          _id: {
            $in: dataState.changeList.map((r) => r._id),
          },
        },
        doc: dataState.changes,
      }).then((results) => {
        console.log('update results', results);
      });
    } else {
      ipcRenderer.invoke('insert-many', {
        name: dataState.name,
        docs: [dataState.changes],
      }).then((results) => {
        console.log('insert results', results);
      });
    }
    dispatch({
      type: 'SCHEMA_DATA_CLEAR',
    });
    setDetailOpen(false);
    tableRef.current.onQueryChange();
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
    setSnackbarOpen(false);
  };

  return (
    <>
      {(dataState.materialDefinition && dataState.materialDefinition.length > 0) && (
        <MaterialTable
          tableRef={tableRef}
          isLoading={isLoading}
          title={dataState.name}
          options={{
            search: false,
            pageSize,
            selection: true,
            filtering: true,
            pageSizeOptions: [20, 50, 100],
          }}
          columns={dataState.materialDefinition}
          data={(query) =>
            new Promise((resolve, reject) => {
              setIsLoading(true);
              const options = {
                limit: query.pageSize,
                skip: query.page * query.pageSize,
                page: query.page,
                sort: query.orderBy
                  ? {
                    [query.orderBy.field]: query.orderDirection,
                  }
                : undefined,
              };
              ipcRenderer.invoke('find', {
                name: dataState.name,
                filter: {
                  ...filter,
                  ...query.filters.reduce((r, v) => {
                    if (typeof v.value === 'object' && v.value.length === 0) {
                      // nothing
                    } else {
                      r[v.column.field] = v.value;
                    }
                    return r;
                  }, {}),
                },
                options,
              }).then((results) => {
                setIsLoading(false);
                resolve({
                  ...results,
                });
              });

            })
          }
          onChangeRowsPerPage={handleChangeRowsPerPage}
          actions={[
            {
              icon: 'add',
              tooltip: t('Add'),
              isFreeAction: true,
              onClick: () => {
                setSelected([]);
                handleClickDetailOpen();
              },
            },
            {
              tooltip: t('Edit Selected Rows'),
              icon: 'edit',
              onClick: (event, rows) => {
                console.log('You want to edit ' + rows.length + ' rows');
                setSelected(rows);
                handleClickDetailOpen();
              },
            },
            {
              tooltip: t('Remove Selected Rows'),
              icon: 'delete',
              onClick: (event, rows) => {
                console.log('You want to delete ' + rows.length + ' rows');
                handleSnackbarClick();
                setSelected(rows);
                ipcRenderer.invoke('remove', {
                  name: dataState.name,
                  filter: {
                    _id: {
                      $in: rows.map((r) => r._id),
                    },
                  },
                }).then((results) => {
                  tableRef.current.onQueryChange();
                  console.log(results);
                });
              },
            },
          ]}
          {...otherProps}
        />
      )}
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        open={detailOpen}
        onClose={handleDetailClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Detail</DialogTitle>
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
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {t('deleted')}
        </Alert>
      </Snackbar>
    </>
  );
}
