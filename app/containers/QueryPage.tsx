import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';


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
