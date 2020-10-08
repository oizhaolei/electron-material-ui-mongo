import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import Icon from '@material-ui/core/Icon';

import { Link } from 'react-router-dom';

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      textDecoration: 'none',
      color: 'inherit',
    },
  })
);

export const TableListItems = ({ current }) => {
  const classes = useStyles();
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    setSchemas(ipcRenderer.sendSync('schemas', { sync: true }));
  }, []);

  return (
    <>
      <ListSubheader inset>Tables</ListSubheader>
      {schemas.map((t) => (
        <Link
          key={t.name}
          to={`/table/${t.name}`}
          className={classes.link}
        >
          <ListItem button selected={current === t.name}>
            <ListItemIcon>
              <Icon>{t.icon}</Icon>
            </ListItemIcon>
            <ListItemText primary={t.name} />
          </ListItem>
        </Link>
      ))}
    </>
  );
};

export const QueryListItems= ({ current }) => {
  const classes = useStyles();
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    setQueries(ipcRenderer.sendSync('queries', { sync: true }));
  }, []);

  return (
    <>
      <ListSubheader inset>Query</ListSubheader>
      {queries.map((q) => (
        <Link
          key={q.name}
          to={`/query/${q.name}`}
          className={classes.link}
        >
          <ListItem button selected={current === q.name}>
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary={q.name} />
          </ListItem>
        </Link>
      ))}
      <Link to="/tabs" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Tabs" />
        </ListItem>
      </Link>
      <Link to="/test" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Test" />
        </ListItem>
      </Link>
      <Link to="/pincode" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Pincode" />
        </ListItem>
      </Link>
    </>
  );
};
