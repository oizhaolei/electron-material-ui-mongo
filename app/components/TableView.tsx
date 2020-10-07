import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

export default function TableView({ label, onChange }) {
  const classes = useStyles();
  const [tables, setTables] = useState([]);
  const [table, setTable] = React.useState('');
  const [fields, setFields] = useState([]);
  const [field, setField] = React.useState('');

  useEffect(() => {
    setTables(ipcRenderer.sendSync('schemas', { sync: true }));
  }, []);

  const handleTableChange = (event) => {
    setTable(event.target.value);
    setFields(tables.find((t) => t.name === event.target.value));
    setField('');
  };
  const handleFieldChange = (event) => {
    setField(event.target.value);
  };

  return (
    <div className={classes.root}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Select
            value={table}
            onChange={handleTableChange}
            displayEmpty
            className={classes.selectEmpty}
          >
            {
              tables.map((t) => (
                <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
              ))
            }
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Select
            value={field}
            onChange={handleFieldChange}
            displayEmpty
            className={classes.selectEmpty}
          >
            {
              fields.map((f) => (
                <MenuItem value={f}>f</MenuItem>
              ))
            }
          </Select>
        </Grid>
      </Grid>
    </div>
  );
}
