import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron';

import { makeStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DropzoneArea } from 'material-ui-dropzone';
import MaterialTable from 'material-table';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { mongo2Material } from '../utils/utils';

const isEqual = (obj1, obj2) => {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (let objKey of obj1Keys) {
    if (obj1[objKey] !== obj2[objKey]) {
      if (typeof obj1[objKey] === 'object' && typeof obj2[objKey] === 'object') {
        if(!isEqual(obj1[objKey], obj2[objKey])) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
};

const CSVDataTable = ({ columns, data }) => {
  return (
    <MaterialTable
      title="Data"
      columns={columns}
      data={data}
    />
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function ImportTable({ dispatch, dataState }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [definition, setDefinition] = useState([]);
  const [warning, setWarning] = useState([]);

  return (
    <div className={classes.root}>
      <Typography variant="body2" gutterBottom>
        {t('ImportTable demo')}
      </Typography>
      {loading && <CircularProgress />}
      <DropzoneArea
        acceptedFiles={['text/csv']}
        dropzoneText={t('Drag and drop an CSV here or click')}
        onChange={(files) => {
          if (files && files.length > 0) {
            setLoading(true);
            ipcRenderer
              .invoke('csv-read', files[0].path)
              .then(({ definition, data }) => {
                setLoading(false);
                setDefinition(definition);
                setData(data);

                if (isEqual(definition, dataState.definition)) {
                  setWarning();
                } else {
                  setWarning(t('different data structure'));
                }
              });
          }
        }}
      />
      {data && data.length > 0 && (
        <CSVDataTable
          columns={mongo2Material(definition)}
          data={data}
        />
      )}

      {warning && (
        <Typography color="error" variant="caption" display="block" gutterBottom>
          {warning}
        </Typography>
      )}

      {data.length > 0 && (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SaveIcon />}
          onClick={() =>
            ipcRenderer.invoke('insert-many', {
              name: dataState.name,
              docs: data,
            })
          }
        >
          {t('Save')}
        </Button>
      )}
    </div>
  );
}
