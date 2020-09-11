import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

import MaterialTable from 'material-table';

import GenericTemplate from '../templates/GenericTemplate';

const store = new Store();

export default function TablePage({ match }) {
  const { table } = match.params;

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(store.get('pageSize', 5));

  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
  };

  useEffect(() => {
    const findListener = (event, { schema, records }) => {
      setColumns(schema);
      setData(records);
    };
    ipcRenderer.on('find', findListener);
    ipcRenderer.send('find', {
      table,
    });
    return () => {
      ipcRenderer.removeListener('find', findListener);
    };
  }, [table]);

  return (
    <GenericTemplate title={table}>
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
      />
    </GenericTemplate>
  );
}
