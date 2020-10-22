import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

const filter = createFilterOptions();

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

const FreeSolo = ({ label, value, onChange, options }) => {
  const { t } = useTranslation();
  return (
    <Autocomplete
      value={value}
      onChange={onChange}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (params.inputValue !== '') {
          filtered.push({
            inputValue: params.inputValue,
            title: `Add "${params.inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={options}
      getOptionLabel={(option) => {
        console.log('FreeSolo option:', option);
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option && option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.title || '';
      }}
      renderOption={(option) => option.title}
      style={{ width: 300 }}
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 800,
  },
}));

export default function DetailForm({ definition, suggests, list, dispatch }) {
  const [values, setValues] = useState(sameValue(list));

  const handleChange = (field, value) => {
    setValues({
      ...values,
      [field]: value,
    });
    dispatch({
      type: 'SCHEMA_DATA_CHANGE',
      payload: {
        list,
        field,
        value,
      },
    });
  };

  return (
    <Grid container spacing={3}>
      {Object.keys(definition).map((field) => (
        <Grid key={field} item xs={12}>
          {suggests[field] ? (
            <FreeSolo
              label={field}
              value={{
                title: values[field],
              }}
              onChange={(event, newValue) => {
                let theValue = newValue;
                if (typeof newValue === 'string') {
                  theValue = newValue;
                } else if (newValue && newValue.inputValue) {
                  // Create a new value from the user input
                  theValue = newValue.inputValue;
                } else if (newValue && newValue.title) {
                  theValue = newValue.title;
                }
                handleChange([field], theValue);
              }}
              options={suggests[field].map((v) => ({
                title: v,
              }))}
            />
          ) : (
            <TextField
              required
              id={field}
              name={field}
              label={field}
              fullWidth
              value={values[field]}
              onChange={(event) => {
                handleChange([field], event.target.value);
              }}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
}
