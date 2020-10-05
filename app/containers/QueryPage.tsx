import React, { useState } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import GenericTemplate from '../templates/GenericTemplate';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function TablePage({ match }) {
  const classes = useStyles();
  const { query } = match.params;

  return (
    <GenericTemplate title={query} id={query}>
      <Paper square key={query}>
        Query
      </Paper>
    </GenericTemplate>
  );
}
