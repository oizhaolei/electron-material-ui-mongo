import React from 'react';
import { useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import MaterialTable from 'material-table';

const columns = [
  {
    title: 'Field',
    field: 'field',
  },
  {
    title: 'Type',
    field: 'type',
    lookup: {
      Number: 'Number',
      Boolean: 'Boolean',
      Date: 'Date',
      String: 'String',
    },
  },
];
export default function SchemaTable({ dataState, dispatch }) {
  const { t } = useTranslation();

  const data = Object.keys(dataState.definition).map((k) => ({
    field: k,
    type: dataState.definition[k].type,
  }));

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('schematable demo')}
      </Typography>
      <MaterialTable
        title={dataState.name}
        options={{
          exportButton: true,
          exportAllData: true,
          search: false,
          paging: false,
        }}
        columns={columns}
        data={data}
      />
    </>
  );
}
