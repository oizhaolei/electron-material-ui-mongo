import React from 'react';

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import Chart from '../components/dashboard/Chart';
import Deposits from '../components/dashboard/Deposits';
import Orders from '../components/dashboard/Orders';

import GenericTemplate from '../templates/GenericTemplate';

const useStyles = makeStyles((theme) => ({
}));

export default function Dashboard({ match }) {
  const classes = useStyles();

  return (
    <GenericTemplate title="Dashboard">
      Table: {match.params.table}
    </GenericTemplate>
  );
}
