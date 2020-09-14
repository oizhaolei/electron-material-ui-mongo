import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
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
          <ListItemText primary="Checkout" />
        </ListItem>
      </Link>
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
      <Link to="/products" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="商品ページ" />
        </ListItem>
      </Link>
    </>
  );
};

export const SecondaryListItems = ({ current }) => {
  console.log('current:', current);
  const classes = useStyles();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const tablesListener = (event, arg) => {
      setTables(arg);
    };
    ipcRenderer.on('tables', tablesListener);
    ipcRenderer.send('tables');

    return () => {
      ipcRenderer.removeListener('tables', tablesListener);
    };
  }, []);

  return (
    <>
      <ListSubheader inset>Tables</ListSubheader>
      {tables.map((record) => (
        <Link key={record} to={`/table/${record}`} className={classes.link}>
          <ListItem button selected={current === record}>
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
