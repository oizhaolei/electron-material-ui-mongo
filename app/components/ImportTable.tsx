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
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';

import { mongo2Material } from '../utils/utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  paper: {
    width: 200,
    height: 230,
    overflow: 'auto',
  },
}));

const CustomList = ({ title, items }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <List
        dense
        component="div"
        role="list"
        subheader={<ListSubheader>{title}</ListSubheader>}
      >
        {items.map((item) => (
          <ListItem key={item} role="listitem" button>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const CompareList = ({ left, right, leftTitle, rightTitle }) => (
  <Grid container spacing={6} justify="center" alignItems="center">
    <Grid item>
      <CustomList title={leftTitle} items={left} />
    </Grid>
    <Grid item>
      <CustomList title={rightTitle} items={right} />
    </Grid>
  </Grid>
);

const CSVDataTable = ({ columns, data }) => {
  return <MaterialTable title="Data" columns={columns} data={data} />;
};

export default function ImportTable({ dispatch, dataState }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [definition, setDefinition] = useState([]);

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
                setError('');
              })
              .catch((e) => {
                setError(e.toString());
              });
          }
        }}
      />

      {definition && definition.length > 0 && (
        <>
          <Typography variant="caption" display="block" gutterBottom>
            列の比較
          </Typography>
          <CompareList
            left={Object.keys(dataState.definition)}
            right={Object.keys(definition)}
            leftTitle="テーブル"
            rightTitle="CSVファイル"
          />
        </>
      )}
      {data && data.length > 0 && (
        <CSVDataTable columns={mongo2Material(definition)} data={data} />
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
            })}
        >
          {t('Save')}
        </Button>
      )}
      <Typography color="error" variant="body1" gutterBottom>
        {error}
      </Typography>
    </div>
  );
}
