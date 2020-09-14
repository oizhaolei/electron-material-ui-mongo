import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

import Button from '@material-ui/core/Button';
import MaterialTable, { MTableToolbar } from 'material-table';

const store = new Store();

export default function DataTable({ table, query }) {
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(store.get('pageSize', 5));

  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
  };

  useEffect(() => {
    const findListener = (event, { schema, records }) => {
      console.log('schema, records:', schema, records);
      setColumns(schema);
      setData(records);
    };
    ipcRenderer.on('find', findListener);
    ipcRenderer.send('find', {
      table,
      query,
    });
    return () => {
      ipcRenderer.removeListener('find', findListener);
    };
  }, [table]);

  return (
    <MaterialTable
      title={table}
      options={{
        pageSize,
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
      onChangeRowsPerPage={handleChangeRowsPerPage}
      actions={[
        {
          icon: 'add',
          tooltip: 'Add',
          isFreeAction: true,
          onClick: console.log,
        },
      ]}
      components={{
        Toolbar: (props) => (
          <div>
            <MTableToolbar {...props} />
            <div style={{ padding: '0px 10px' }}>
              <Button variant="contained">Default</Button>
            </div>
          </div>
        ),
      }}
    />
  );
}
