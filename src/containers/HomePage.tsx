import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import Tables from '../components/dashboard/Tables';
import Queries from '../components/dashboard/Queries';

import GenericTemplate from '../templates/GenericTemplate';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
}));

function Dashboard() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <GenericTemplate title={t('dashboard')} id="dashboard">
      <Typography variant="body2" gutterBottom>
        {t('dashboard demo')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Tables />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <Queries />
          </Paper>
        </Grid>
      </Grid>
    </GenericTemplate>
  );
}
export default Dashboard;
