import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';

import MaterialTable from 'material-table';

import DetailForm from './DetailForm';

const store = new Store();

export default function DataTable({ table }) {
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(store.get('pageSize', 5));

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const handleClickDetailOpen = () => {
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
  };
  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
  };

  // delete snackbar
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setDeleteOpen(false);
  };

  useEffect(() => {
    const schemaListener = (event, { schema }) => {
      console.log('schema:', schema);
      setColumns(Object.keys(schema.definition).map((k) => ({
        title: k,
        field: k,
      })));
    };
    ipcRenderer.on('schema', schemaListener);
    ipcRenderer.send('schema', {
      table,
    });
    return () => {
      ipcRenderer.removeListener('schema', schemaListener);
    };
  }, [table]);

  return (
    <>
      <MaterialTable
        title={table}
        options={{
          pageSize,
          selection: true,
          filtering: true,
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
              table,
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
        onSelectionChange={(rows) => console.log('You selected ' + rows.length + ' rows')}
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
              handleDeleteClick();
            },
          },
        ]}
        editable={{
          onRowAdd: (newData) => console.log('onRowAdd: ', newData),
          onRowUpdate: (newData, oldData) =>console.log('onRowUpdate: ', newData, oldData),
          onRowDelete: (oldData) => console.log('onRowDelete: ', oldData),
        }}
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
            columns={columns}
            list={selected}
            onChange={console.log}
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>Cancel</Button>
          <Button onClick={handleDetailClose} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={deleteOpen}
        autoHideDuration={6000}
        onClose={handleDeleteClose}
        message="Deleting..."
        action={
          <Button
            color="secondary"
            size="small"
            onClick={handleDeleteClose}
          >
            UNDO
          </Button>
        }
      />
    </>
  );
}
