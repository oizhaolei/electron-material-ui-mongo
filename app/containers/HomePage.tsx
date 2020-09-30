import React, { useState } from 'react';

import { withRouter } from 'react-router-dom';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import TableChartIcon from '@material-ui/icons/TableChart';
import FindInPageIcon from '@material-ui/icons/FindInPage';

import Chart from '../components/dashboard/Chart';
import Deposits from '../components/dashboard/Deposits';
import Orders from '../components/dashboard/Orders';

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
  speedDial: {
    position: 'absolute',
    '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
      top: theme.spacing(2),
      left: theme.spacing(2),
    },
  },
}));

function Dashboard({ history }) {
  const classes = useStyles();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: <TableChartIcon />,
      name: 'Table',
      action: () => {
        setOpen(false);
        history.push('/schema-wizard');
      },
    },
    {
      icon: <FindInPageIcon />,
      name: 'Query',
      action: () => {
        setOpen(false);
        history.push('/query-wizard');
      },
    },
  ];

  const handleOpen = () => {
    setOpen(true);
  };
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
        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Orders />
          </Paper>
        </Grid>
      </Grid>
      <SpeedDial
        ariaLabel="SpeedDial example"
        className={classes.speedDial}
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((a) => (
          <SpeedDialAction
            key={a.name}
            icon={a.icon}
            tooltipTitle={a.name}
            tooltipOpen
            onClick={a.action}
          />
        ))}
      </SpeedDial>
    </GenericTemplate>
  );
}
export default withRouter(Dashboard);
