import React from 'react';

import MaterialTable from 'material-table';

export default function FreeDataTable({ title, data = [] }) {
  let columns = [];
  if (data.length > 0) {
    const longestData = data.reduce((r, v) => {
      if (Object.keys(r) < Object.keys(v)) {
        return v;
      }
      return r;
    }, {});
    columns = Object.keys(longestData)
      .filter((col) => typeof longestData[col] === 'string')
      .map((col) => ({
        key: col,
        field: col,
        title: col,
        headerStyle: {
          whiteSpace: 'nowrap',
        },
      }));
  }

  return (
    <MaterialTable
      title={title}
      columns={columns}
      data={data}
      options={{
        exportButton: true,
        search: false,
        pageSize: data.length > 10 ? 10 : data.length,
      }}
    />
  );
}
