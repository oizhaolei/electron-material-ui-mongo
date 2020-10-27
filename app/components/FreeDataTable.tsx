import React from 'react';

import MaterialTable from 'material-table';

export default function FreeDataTable({ title, data = [] }) {
  const columns =
    data.length > 0
      ? Object.keys(data[0])
          .filter((col) => typeof data[0][col] === 'string')
          .map((col) => ({
            key: col,
            field: col,
            title: col,
          }))
      : [];

  return (
    <MaterialTable
      title={title}
      columns={columns}
      data={data}
      options={{
        exportButton: true,
        search: false,
      }}
    />
  );
}
