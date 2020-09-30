import React, { useState, useEffect, useRef, useMemo } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

const commonValue = (list, f) => {
  const cols = list.map((row) => row[f]);
  const cell0 = cols[0];
  for (const cell of cols) {
    if (cell !== cell0) {
      return '';
    }
  }
  return cell0;
};

const sameValue = (list) => {
  const uniqFields = [...new Set(list.map((doc) => Object.keys(doc)).flat())];
  const commonValues = uniqFields.reduce((r, v) => {
    r[v] = commonValue(list, v);
    return r;
  }, {});
  return commonValues;
};

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 800,
  },
}));

export default function DetailForm({ columns, list, onChange }) {
  const [values, setValues] = useState(sameValue(list));

  useEffect(() => {
  }, [list]);

  const handleChange = (event) => setValues({
    ...values,
    [col.field]: event.target.value,
  });

  return (
    <Grid container spacing={3}>
      {
        columns.map((col) => (
          <Grid item xs={12}>
            <TextField
              required
              key={col.field}
              id={col.field}
              name={col.field}
              label={col.title}
              fullWidth
              value={values[col.field]}
              onChange={handleChange}
            />
          </Grid>
        ))
      }
    </Grid>
  );
}
