import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

import MaterialTable from 'material-table';

const store = new Store();

export default function SchemaTable({ schemaName }) {
  const columns = [
    { title: 'Field', field: 'field' },
    { title: 'Type', field: 'type' },
  ];
  const [data, setData] = useState([]);

  useEffect(() => {
    const schemaListener = (event, schema) => {
      setData(
        Object.keys(schema.definition).map((k) => ({
          field: k,
          type: schema.definition[k].type,
        }))
      );
    };
    ipcRenderer.on('schema', schemaListener);
    ipcRenderer.send('schema', schemaName);
    return () => {
      ipcRenderer.removeListener('schema', schemaListener);
    };
  }, [schemaName]);

  return (
    <MaterialTable
      title={schemaName}
      options={{
        pageSize: 1000,
        selection: true,
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
      editable={{
        onRowAdd: newData =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              setData([...data, newData]);

              resolve();
            }, 1000)
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              const dataUpdate = [...data];
              const index = oldData.tableData.field;
              dataUpdate[index] = newData;
              setData([...dataUpdate]);

              resolve();
            }, 1000)
          }),
        onRowDelete: oldData =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              const dataDelete = [...data];
              const index = oldData.tableData.field;
              dataDelete.splice(index, 1);
              setData([...dataDelete]);

              resolve()
            }, 1000)
          }),
      }}
    />
  );
}
