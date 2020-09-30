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

export const SecondaryListItems = ({ current }) => {
  const classes = useStyles();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const schemasListener = (event, arg) => {
      setTables(arg);
    };
    ipcRenderer.on('schemas', schemasListener);
    ipcRenderer.send('schemas');

    return () => {
      ipcRenderer.removeListener('schemas', schemasListener);
    };
  }, []);

  return (
    <>
      <ListSubheader inset>Tables</ListSubheader>
      {tables.map((t) => (
        <Link
          key={t.table}
          to={`/table/${t.table}`}
          className={classes.link}
        >
          <ListItem button selected={current === t.table}>
            <ListItemIcon>
              <Icon>{t.icon}</Icon>
            </ListItemIcon>
            <ListItemText primary={t.table} />
          </ListItem>
        </Link>
      ))}
    </>
  );
};
