import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import StorageIcon from '@material-ui/icons/Storage';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

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
  const history = useHistory();

  useEffect(() => {
    ipcRenderer.invoke('schemas').then(setSchemas);
  }, []);

  const dropSchema = (name) => {
    ipcRenderer
      .invoke('schema-drop', {
        name,
      })
      .then((results) => {
        log.info('schema-drop:', results);
        history.replace('/');
      })
      .catch((e) => {
        log.error(e);
      });
  };

  return (
    <>
      <ListSubheader inset>
        {t('Tables')}
        <ListItemSecondaryAction>
          <Link to="/schema-wizard" className={classes.link}>
            <IconButton aria-label={t('Add Table')} size="small">
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Link>
        </ListItemSecondaryAction>
      </ListSubheader>
      {schemas.map((s) => (
        <Link key={s.name} to={`/table/${s.name}`} className={classes.link}>
          <ListItem button selected={current === s.name}>
            <ListItemIcon>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText primary={s.name} />
            {
              current === s.name && (
                <ListItemSecondaryAction>
                  <IconButton aria-label={t('Drop Table')} size="small" onClick={() => dropSchema(s.name)}>
                    <RemoveIcon fontSize="inherit" />
                  </IconButton>
                </ListItemSecondaryAction>
              )
            }
          </ListItem>
        </Link>
      ))}
    </>
  );
};

export const QueryListItems = ({ current }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [queries, setQueries] = useState([]);
  const history = useHistory();

  useEffect(() => {
    ipcRenderer.invoke('queries').then(setQueries);
  }, []);

  const dropQuery = (name) => {
    ipcRenderer
      .invoke('query-delete', {
        name,
      })
      .then((results) => {
        log.info('query-delete:', results);
        history.replace('/');
      })
      .catch((e) => {
        log.error(e);
      });
  };

  return (
    <>
      <ListSubheader inset>
        {t('Query')}
        <ListItemSecondaryAction>
          <Link to="/query-wizard" className={classes.link}>
            <IconButton aria-label={t('Add Query')} size="small">
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Link>
        </ListItemSecondaryAction>
      </ListSubheader>
      {queries.map((q) => (
        <Link key={q.name} to={`/query/${q.name}`} className={classes.link}>
          <ListItem button selected={current === q.name}>
            <ListItemIcon>
              <FindInPageIcon />
            </ListItemIcon>
            <ListItemText primary={q.name} />
            {
              current === q.name && (
                <ListItemSecondaryAction>
                  <IconButton aria-label={t('Drop Query')} size="small" onClick={() => dropQuery(q.name)}>
                    <RemoveIcon fontSize="inherit" />
                  </IconButton>
                </ListItemSecondaryAction>
              )
            }
          </ListItem>
        </Link>
      ))}
      <Link to="/test" className={classes.link}>
        <ListItem button>
          <ListItemIcon>
            <FindInPageIcon />
          </ListItemIcon>
          <ListItemText primary="Test" />
        </ListItem>
      </Link>
    </>
  );
};
