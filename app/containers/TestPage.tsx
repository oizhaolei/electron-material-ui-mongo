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
    const replyListener = (event, arg) => {
      console.log(arg);
      setText(arg);
    };
    ipcRenderer.on('asynchronous-reply', replyListener);

    const dbpathListener = (event, arg) => {
      console.log(arg);
      setText(arg);
    };
    ipcRenderer.on('dbpath', dbpathListener);

    const tablesListener = (event, arg) => {
      console.log(arg);
      setText(arg.join());
    };
    ipcRenderer.on('tables', tablesListener);

    const analysisListener = (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    };
    ipcRenderer.on('analysis', analysisListener);

    const findListener = (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    };
    ipcRenderer.on('find', findListener);
    return () => {
      ipcRenderer.removeListener('asynchronous-reply', replyListener);
      ipcRenderer.removeListener('dbpath', dbpathListener);
      ipcRenderer.removeListener('tables', tablesListener);
      ipcRenderer.removeListener('analysis', analysisListener);
      ipcRenderer.removeListener('find', findListener);
    };
  }, []);

  return (
    <GenericTemplate title="Test" id="test">
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
          onClick={() => ipcRenderer.send('analysis')}
        >
          Analysis All
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            ipcRenderer.send('find', {
              table: 'projects',
            })}
        >
          Find: projects
        </Button>
        <Typography variant="body1" gutterBottom>
          {text}
        </Typography>
      </div>
    </GenericTemplate>
  );
}
