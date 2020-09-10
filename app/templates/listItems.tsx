import React, { useState, useEffect } from 'react';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import AssignmentIcon from '@material-ui/icons/Assignment';

import { Link } from 'react-router-dom';

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      textDecoration: 'none',
      color: 'inherit',
    },
  })
);

export const MainListItems = () => {
  const classes = useStyles();

  return (
    <>
      <Link to="/checkout" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </Link>
      <Link to="/products" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Orders" />
        </ListItem>
      </Link>
      <Link to="/counter" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Customers" />
        </ListItem>
      </Link>
      <ListItem button>
        <ListItemIcon>
          <BarChartIcon />
        </ListItemIcon>
        <ListItemText primary="Reports" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <LayersIcon />
        </ListItemIcon>
        <ListItemText primary="Integrations" />
      </ListItem>
    </>
  );
};

export const SecondaryListItems = () => {
  const classes = useStyles();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    setTables([]);
  }, []);

  return (
    <>
      <ListSubheader inset>Tables</ListSubheader>
      {tables.map((record) => (
        <Link key={record} to={`/table/${record}`} className={classes.link}>
          <ListItem button>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary={record} />
          </ListItem>
        </Link>
      ))}
    </>
  );
};
