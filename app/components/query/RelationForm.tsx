import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import TableView from '../TableView';

export default function RelationForm({ dataState, onChange }) {
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
        One-to-Many relation
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TableView
            label="One"
            onChange={({ table, field }) => handleRelationChange('one', table, field)}
          />
        </Grid>
        <Grid item xs={6}>
        <TableView
            label="Many"
            onChange={({ table, field }) => handleRelationChange('many', table, field)}
          />
        </Grid>
      </Grid>
    </>
  );
}
