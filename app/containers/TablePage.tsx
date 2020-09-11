import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import MaterialTable from 'material-table';

import GenericTemplate from '../templates/GenericTemplate';

export default function TablePage({ match }) {
  const { table } = match.params;

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    ipcRenderer.on('find', (event, { schema, records }) => {
      console.log('find', schema, records);
      setColumns(schema);
      setData(records);
    });
    ipcRenderer.send('find', {
      table,
    });
    return () => {
      ipcRenderer.removeAllListeners('find');
    };
  }, [table]);

  return (
    <GenericTemplate title={table}>
      <MaterialTable
        title={table}
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
      />
    </GenericTemplate>
  );
}
