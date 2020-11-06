import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';
import pluralize from 'pluralize';

import { makeStyles, createStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import StorageIcon from '@material-ui/icons/Storage';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';

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
  const [open, setOpen] = useState();

  const handleClose = (event, reason) => {
    if (reason === 'confirmed') {
      ipcRenderer
        .invoke('schema-drop', {
          name: pluralize(open),
        })
        .then((results) => {
          log.info('schema-drop:', results);
          history.replace('/');
        })
        .catch((e) => {
          log.error(e);
        });
    }

    setOpen(false);
  };

  useEffect(() => {
    ipcRenderer.invoke('schemas').then(setSchemas);
  }, []);

  const dropSchema = (name) => {
    setOpen(name);
  };

  return (
    <>
      <ListSubheader inset>
        {t('tables')}
        <ListItemSecondaryAction>
          <Link to="/schema-wizard" className={classes.link}>
            <IconButton aria-label={t('add table')} size="small">
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
            {current === s.name && (
              <ListItemSecondaryAction>
                <IconButton
                  aria-label={t('drop table')}
                  size="small"
                  onClick={() => dropSchema(s.name)}
                >
                  <RemoveIcon fontSize="inherit" />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        </Link>
      ))}
      <Snackbar
        open={!!open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={t('confirm delete schema')}
        action={
          <React.Fragment>
            <Button
              color="secondary"
              size="small"
              onClick={(e) => handleClose(e, 'confirmed')}
            >
              {t('ok')}
            </Button>
            <IconButton
              size="small"
              aria-label={t('close')}
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
};

export const QueryListItems = ({ current }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [queries, setQueries] = useState([]);
  const history = useHistory();
  const [open, setOpen] = useState();

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'confirmed') {
      ipcRenderer
        .invoke('query-drop', {
          name: pluralize(open),
        })
        .then((results) => {
          log.info('query-drop:', results);
          history.replace('/');
        })
        .catch((e) => {
          log.error(e);
        });
    }

    setOpen(false);
  };

  useEffect(() => {
    ipcRenderer.invoke('queries').then(setQueries);
  }, []);

  const dropQuery = (name) => {
    setOpen(name);
  };

  return (
    <>
      <ListSubheader inset>
        {t('query')}
        <ListItemSecondaryAction>
          <Link to="/query-wizard" className={classes.link}>
            <IconButton aria-label={t('add query')} size="small">
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
            {current === q.name && (
              <ListItemSecondaryAction>
                <IconButton
                  aria-label={t('drop query')}
                  size="small"
                  onClick={() => dropQuery(q.name)}
                >
                  <RemoveIcon fontSize="inherit" />
                </IconButton>
              </ListItemSecondaryAction>
            )}
          </ListItem>
        </Link>
      ))}
      <Snackbar
        open={!!open}
        autoHideDuration={6000}
        onClose={handleClose}
        message={t('confirm delete query')}
        action={
          <React.Fragment>
            <Button
              color="secondary"
              size="small"
              onClick={(e) => handleClose(e, 'confirmed')}
            >
              {t('ok')}
            </Button>
            <IconButton
              size="small"
              aria-label={t('close')}
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />
    </>
  );
};
