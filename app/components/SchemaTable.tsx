import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import Store from 'electron-store';

import MaterialTable from 'material-table';

const store = new Store();

export default function DataTable({ table, query }) {
  const columns = [
    { title: 'Title', field: 'title' },
    { title: 'Field', field: 'field' },
    { title: 'Type', field: 'type' },
    { title: 'Align', field: 'align' },
    { title: 'PK', field: 'pk' },
  ];
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(store.get('pageSize', 5));

  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
  };

  useEffect(() => {
    const findListener = (event, { schema }) => {
      console.log('schema:', schema);
      setData(schema);
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
      onChangeRowsPerPage={handleChangeRowsPerPage}
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
