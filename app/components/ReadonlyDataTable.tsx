import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import Store from 'electron-store';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import MaterialTable from 'material-table';

import { mongo2MaterialType } from '../utils/utils';

const store = new Store();

export default function ReadonlyDataTable({
  schemaName,
  dialogContent,
  filter = {},
  ...otherProps
}) {
  const { t } = useTranslation();
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(store.get('pageSize', 20));

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const handleClickDetailOpen = (event, rowData) => {
    setSelected([rowData]);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
  };
  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
  };

  useEffect(() => {
    const schemaListener = (event, schema) => {
      console.log('schema:', schema);
      if (schemaName === schema.name) {
        setColumns(
          Object.keys(schema.definition).map((k) => ({
            title: k,
            field: k,
            type: mongo2MaterialType(schema.definition[k].type),
            headerStyle: {
              whiteSpace: 'nowrap',
            },
            lookup: schema.suggests[k]
              ? schema.suggests[k].reduce((r, v) => (r[v] = v, r), {})
              : undefined,
          }))
        );
      }
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
        onChangeRowsPerPage={handleChangeRowsPerPage}
        actions={[
          {
            icon: 'comment',
            tooltip: 'Detail',
            onClick: handleClickDetailOpen,
          },
        ]}
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
          {dialogContent &&
           dialogContent({
             columns,
             list: selected,
           })}
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
    </>
  );
}
