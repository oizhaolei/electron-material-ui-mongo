import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

import MaterialTable from 'material-table';

const store = new Store();

export default function SchemaTable({ table }) {
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'Field', field: 'field' },
  ];
  const [data, setData] = useState([]);

  useEffect(() => {
    const schemaListener = (event, { schema }) => {
      setData(
        Object.keys(schema.definition).map((k) => ({
          title: k,
          field: k,
        }))
      );
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
    <MaterialTable
      title={table}
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
      actions={[
        {
          icon: 'add',
          tooltip: 'Add',
          isFreeAction: true,
          onClick: console.log,
        },
        {
          icon: 'delete',
          tooltip: 'Delete',
          onClick: console.log,
        },
      ]}
    /* components={{ */
    /*   Toolbar: (props) => ( */
    /*     <div> */
    /*       <MTableToolbar {...props} /> */
    /*       <div style={{ padding: '0px 10px' }}> */
    /*         <Button variant="contained">Default</Button> */
    /*       </div> */
    /*     </div> */
    /*   ), */
    /* }} */
    />
  );
}
