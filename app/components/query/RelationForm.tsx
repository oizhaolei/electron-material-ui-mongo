import React from 'react';
import { useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import TableView from '../TableView';

export default function RelationForm({ dataState, onChange }) {
  const { t } = useTranslation();

  const handleRelationChange = (r, table, field) => {
    onChange({
      [r]: {
        table,
        field,
      },
    });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        One-to-Many relation - {dataState.name}
      </Typography>
      <Typography variant="body2" gutterBottom>
        二つテーブルを選んで、One-Manyの関係を指定してください。
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TableView
            label={t('One')}
            onChange={(table, field) => handleRelationChange('one', table, field)}
          />
        </Grid>
        <Grid item xs={6}>
          <TableView
            label={t('Many')}
            onChange={(table, field) => handleRelationChange('many', table, field)}
          />
        </Grid>
      </Grid>
    </>
  );
}
