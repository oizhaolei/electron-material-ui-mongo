import React from 'react';

import MaterialTable from 'material-table';

export default function FreeDataTable({ title, data: { data, columns } }) {
  let cols =
    columns &&
    columns.map((col) => ({
      key: col,
      field: col,
      title: col,
      headerStyle: {
        whiteSpace: 'nowrap',
      },
    }));
  if (data.length > 0 && !cols) {
    const longestData = data.reduce((r, v) => {
      if (Object.keys(r) < Object.keys(v)) {
        return v;
      }
      return r;
    }, {});
    cols = Object.keys(longestData)
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
      columns={cols}
      data={data}
      options={{
        exportButton: true,
        exportAllData: true,
        search: false,
        pageSize: data.length > 10 ? 10 : data.length,
      }}
    />
  );
}
