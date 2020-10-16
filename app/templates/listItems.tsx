import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import StorageIcon from '@material-ui/icons/Storage';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';

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
  const { t } = useTranslation();
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    setSchemas(ipcRenderer.sendSync('schemas', { sync: true }));
  }, []);

  return (
    <>
      <ListSubheader inset>
        {t('Tables')}
        <Link to="/schema-wizard" className={classes.link}>
          <IconButton aria-label="add table" size="small">
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Link>
      </ListSubheader>
      {schemas.map((t) => (
        <Link
          key={t.name}
          to={`/table/${t.name}`}
          className={classes.link}
        >
          <ListItem button selected={current === t.name}>
            <ListItemIcon>
              <StorageIcon/>
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
  const { t } = useTranslation();
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    setQueries(ipcRenderer.sendSync('queries', { sync: true }));
  }, []);

  return (
    <>
      <ListSubheader inset>
        {t('Query')}
        <Link to="/query-wizard" className={classes.link}>
          <IconButton aria-label="add query" size="small">
            <AddIcon fontSize="inherit" />
          </IconButton>
        </Link>
      </ListSubheader>
      {queries.map((q) => (
        <Link
          key={q.name}
          to={`/query/${q.name}`}
          className={classes.link}
        >
          <ListItem button selected={current === q.name}>
            <ListItemIcon>
              <FindInPageIcon />
            </ListItemIcon>
            <ListItemText primary={q.name} />
          </ListItem>
        </Link>
      ))}
      <Link to="/pincode" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <LockOpenIcon />
          </ListItemIcon>
          <ListItemText primary="Pincode" />
        </ListItem>
      </Link>
    </>
  );
};
