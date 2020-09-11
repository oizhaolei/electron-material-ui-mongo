import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import GenericTemplate from '../templates/GenericTemplate';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

export default function TestPage() {
  const classes = useStyles();
  const [text, setText] = useState('');

  useEffect(() => {
    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg);
      setText(arg);
    });

    ipcRenderer.on('dbpath', (event, arg) => {
      console.log(arg);
      setText(arg);
    });

    ipcRenderer.on('tables', (event, arg) => {
      console.log(arg);
      setText(arg.join());
    });

    ipcRenderer.on('analysis', (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    });

    ipcRenderer.on('find', (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    });
    return () => {
      ipcRenderer.removeAllListeners('asynchronous-reply');
      ipcRenderer.removeAllListeners('dbpath');
      ipcRenderer.removeAllListeners('tables');
      ipcRenderer.removeAllListeners('analysis');
      ipcRenderer.removeAllListeners('find');
    };
  }, []);

  return (
    <GenericTemplate title="Test">
      <div className={classes.root}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => ipcRenderer.send('asynchronous-message', 'ping')}
        >
          Ping
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => ipcRenderer.send('dbpath')}
        >
          Db Path
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => ipcRenderer.send('tables')}
        >
          Tables
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => ipcRenderer.send('analysis', 'blood.table')}
        >
          Analysis "blood.table"
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            ipcRenderer.send('find', {
              table: 'blood.table',
            })}
        >
          Find "blood.table"
        </Button>
        <Typography variant="body1" gutterBottom>
          {text}
        </Typography>
      </div>
    </GenericTemplate>
  );
}
