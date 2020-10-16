import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';

import ReadonlyDataTable from '../ReadonlyDataTable';

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(1, 0),
  },
  total: {
    fontWeight: 700,
  },
  title: {
    marginTop: theme.spacing(2),
  },
}));

export default function Review({ dataState, onChange }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const classes = useStyles();

  return (
    <>
      {loading && <CircularProgress />}
      <List disablePadding>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('Name')} />
          <Typography variant="subtitle1" className={classes.total}>
            {dataState.name}
          </Typography>
        </ListItem>
        <ListItem className={classes.listItem}>
          <ListItemText primary={t('Relation')} />
          <Typography variant="body1" className={classes.total}>
            {dataState.code}
          </Typography>
        </ListItem>
      </List>

      <ReadonlyDataTable schemaName={dataState.relations.one.table} />
    </>
  );
}
