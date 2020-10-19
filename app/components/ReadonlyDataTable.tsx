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

import { mongo2Material } from '../utils/utils';

const store = new Store();

export default function ReadonlyDataTable({
  schemaName,
  dialogContent,
  filter = {},
  ...otherProps
}) {
  const { t } = useTranslation();
  const [columns, setColumns] = useState([]);
  const [pageSize, setPageSize] = useState(
    store.get(`query.${schemaName}.pageSize`, 20)
  );

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
    store.set(`query.${schemaName}.pageSize`, size);
  };

  useEffect(() => {
    const schema = ipcRenderer.sendSync('schema', {
      name: schemaName,
      sync: true,
    });
    if (schemaName === schema.name) {
      setColumns(mongo2Material(schema));
    }
  }, [schemaName]);

  return (
    <>
      {columns.length > 0 && (
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
          actions={dialogContent ? [
            {
              icon: 'comment',
              tooltip: t('Detail'),
              onClick: handleClickDetailOpen,
            },
          ] : undefined}
          {...otherProps}
        />
      )}
      <Dialog
        open={detailOpen}
        onClose={handleDetailClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Detail</DialogTitle>
        <DialogContent>
          {dialogContent &&
           dialogContent({
             columns,
             list: selected,
           })}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailClose} color="primary">
            {t('Ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
