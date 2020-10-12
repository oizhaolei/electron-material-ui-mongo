import React from 'react';

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import Chart from '../components/dashboard/Chart';
import Deposits from '../components/dashboard/Deposits';
import Orders from '../components/dashboard/Orders';
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

  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  return (
    <GenericTemplate title="Dashboard" id="dashboard">
      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper className={fixedHeightPaper}>
            <Chart />
          </Paper>
        </Grid>
        {/* Recent Deposits */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper className={fixedHeightPaper}>
            <Deposits />
          </Paper>
        </Grid>
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
