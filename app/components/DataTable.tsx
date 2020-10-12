import React, { useState, useEffect } from 'react';
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

import { mongo2MaterialType } from '../utils/utils';

const store = new Store();

export default function DataTable({
  schemaName,
  readonly = true,
  dialogContent,
  filter = {},
  ...otherProps
}) {
  const { t } = useTranslation();
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
    const schemaListener = (event, schema) => {
      console.log('schema:', schema);
      setColumns(Object.keys(schema.definition).map((k) => ({
        title: k,
        field: k,
        type: mongo2MaterialType(schema.definition[k].type),
        headerStyle: {
          whiteSpace: "nowrap",
        },
        lookup: schema.suggests[k]
          ? schema.suggests[k].reduce((r, v) => (r[v] = v, r), {})
          : undefined,
      })));
    };
    ipcRenderer.on('schema', schemaListener);
    ipcRenderer.send('schema', schemaName);
    return () => {
      ipcRenderer.removeListener('schema', schemaListener);
    };
  }, [schemaName]);

  return (
    <>
      <MaterialTable
        title={schemaName}
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
              name: schemaName,
              filter,
              options,
              sync: true,
            });

            resolve({
            ...results,
            });
          })
        }
        cellEditable={readonly ? undefined : {
          onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
            return new Promise((resolve, reject) => {
              console.log('newValue: ' + newValue);
              setTimeout(resolve, 1000);
            });
          },
        }}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        onSelectionChange={(rows) => console.log('You selected ' + rows.length + ' rows')}
        actions={readonly ? undefined : [
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
        editable={ readonly ? undefined : {
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
          {
            dialogContent && dialogContent({
              columns: columns,
              list: selected,
              onChange: console.log,
            })
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose}>
            {t('Cancel')}
          </Button>
          <Button onClick={handleDetailClose} color="primary">
            {t('Ok')}
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
        message={t('Deleting...')}
        action={
          <Button
            color="secondary"
            size="small"
            onClick={handleDeleteClose}
          >
            {t('UNDO')}
          </Button>
        }
      />
    </>
  );
}
