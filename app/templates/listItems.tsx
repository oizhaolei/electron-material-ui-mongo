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
import * as mui from '@material-ui/icons';

import { Link } from 'react-router-dom';

const allIcons = Object.keys(mui);
console.log('allIcons:', allIcons);

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
      <Link to="/schema-wizard" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Create Table" />
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

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const SecondaryListItems = ({ current }) => {
  const classes = useStyles();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const tablesListener = (event, arg) => {
      setTables(arg.map((t) => ({
        icon: mui[allIcons[getRandomInt(allIcons.length)]],
        table: t,
      })));
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
        <Link key={record.name} to={`/table/${record.name}`} className={classes.link}>
          <ListItem button selected={current === record.name}>
            <ListItemIcon>
              <record.icon />
            </ListItemIcon>
            <ListItemText primary={record.name} />
          </ListItem>
        </Link>
      ))}
    </>
  );
};
