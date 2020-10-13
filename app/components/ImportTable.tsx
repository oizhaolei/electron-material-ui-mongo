import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ipcRenderer } from 'electron';

import { makeStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DropzoneArea } from 'material-ui-dropzone';
import MaterialTable from 'material-table';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { mongo2MaterialType } from '../utils/utils';

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

export default function ImportTable({ dataState }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [definition, setDefinition] = useState([]);
  const [warning, setWarning] = useState([]);

  useEffect(() => {
    const csvReadListener = (event, { definition, data }) => {
      setLoading(false);
      setDefinition(definition);
      setData(data);

      if (isEqual(definition, dataState.definition)) {
        setWarning();
      } else {
        setWarning('既存のデータ構造と一致していません。');
      }
    };
    ipcRenderer.on('csv-read', csvReadListener);

    return () => {
      ipcRenderer.removeListener('csv-read', csvReadListener);
    };
  }, []);

  return (
    <div className={classes.root}>
      {loading && <CircularProgress />}
      <DropzoneArea
        acceptedFiles={['text/csv']}
        dropzoneText={'Drag and drop an CSV here or click'}
        onChange={(files) => {
          if (files && files.length > 0) {
            setLoading(true);
            ipcRenderer.send('csv-read', files[0].path);
          }
        }}
      />
      {data && data.length > 0 && (
        <CSVDataTable
          columns={Object.keys(definition).map((k) => ({
            title: k,
            field: k,
            type: mongo2MaterialType(definition[k].type),
            headerStyle: {
              whiteSpace: "nowrap",
            },
          }))}
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
            ipcRenderer.send('insert-many', {
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
