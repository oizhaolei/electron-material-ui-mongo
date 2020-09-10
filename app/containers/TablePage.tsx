import React, { useState } from 'react';
import MaterialTable from 'material-table';

import GenericTemplate from '../templates/GenericTemplate';

export default function TablePage({ match }) {
  const { table } = match.params;

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   const dbPath = decodeURIComponent(
  //     global.location.search.match(/^\?dbPath=(.*)$/)[1]
  //   );
  //     console.log('dbPath:', dbPath);
  //   const sdb = new Datastore({
  //     filename: path.resolve(dbPath, '_system'),
  //     autoload: true,
  //   });
  //   sdb.find(
  //     { table },
  //     {
  //       title: 1,
  //       field: 1,
  //     },
  //     (err, doc) => {
  //       console.log('doc:', doc);
  //       if (doc) {
  //         setColumns(doc.definition);
  //       }
  //     });
  //   const db = new Datastore({
  //     filename: path.resolve(dbPath, table),
  //     autoload: true,
  //   });
  //   db.find({}, (err, docs) => {
  //     console.log('docs:', docs);
  //     setData(docs);
  //   });
  // }, [table]);

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
