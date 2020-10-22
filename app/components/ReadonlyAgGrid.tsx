import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import Store from 'electron-store';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import { mongo2AgGrid } from '../utils/utils';

const store = new Store();

const columnTypes = {
  numberColumn: {
    width: 130,
    filter: 'agNumberColumnFilter',
    editable: false,
  },
  dateColumn: {
    filter: 'agDateColumnFilter',
    editable: false,
    filterParams: {
      comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateParts = cellValue.split('/');
        var day = Number(dateParts[0]);
        var month = Number(dateParts[1]) - 1;
        var year = Number(dateParts[2]);
        var cellDate = new Date(year, month, day);
        if (cellDate < filterLocalDateAtMidnight) {
          return -1;
        } else if (cellDate > filterLocalDateAtMidnight) {
          return 1;
        } else {
          return 0;
        }
      },
    },
  },
};


export default function ReadonlyDataTable({
  schemaName,
  dialogContent,
  filter = {},
}) {
  const { t } = useTranslation();
  const [columns, setColumns] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [rowData, setRowData] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const onGridReady = (params) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    const options = {
      limit: query.pageSize,
      skip: query.page * query.pageSize,
      page: query.page,
    };
    ipcRenderer.invoke('find', {
      name: schemaName,
      filter: {
        ...filter,
        ...query.filters.reduce((r, v) => {
          r[v.column.field] = v.value;
          return r;
        }, {}),
      },
      options,
    }).then((results) => {
      setRowData(results);
    });
  };
  const onSelectionChanged = () => {
    const rows = gridApi.getSelectedRows();

    setSelected(rows);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
  };

  useEffect(() => {
    ipcRenderer.invoke('schema', {
      name: schemaName,
    }).then((schema => {
      if (schemaName === schema.name) {
        setColumns(mongo2AgGrid(schema));
      }
    }));
  }, [schemaName]);

  return (
    <>
      {columns.length > 0 && (
        <AgGridReact
          columnDefs={columns}
          defaultColDef={{
            flex: 1,
            minWidth: 150,
            filter: true,
          }}
          onGridReady={onGridReady}
          rowData={rowData}
          rowModelType={'infinite'}
          rowSelection="single"
          onSelectionChanged={onSelectionChanged}
          columnTypes={columnTypes}
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
