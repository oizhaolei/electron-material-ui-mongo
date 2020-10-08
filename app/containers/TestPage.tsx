import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

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
  const [text, setText] = useState();
  const { t, i18n } = useTranslation();

  const changeLanguage = () => {
    const getCurrentLng = i18n.language || window.localStorage.i18nextLng || '';

    i18n.changeLanguage(getCurrentLng === 'ja' ? 'en' : 'ja');
  };

  useEffect(() => {
    const replyListener = (event, arg) => {
      console.log(arg);
      setText(arg);
    };
    ipcRenderer.on('asynchronous-reply', replyListener);

    const uriListener = (event, arg) => {
      console.log(arg);
      setText(arg);
    };
    ipcRenderer.on('uri', uriListener);

    const schemasListener = (event, arg) => {
      console.log(arg);
      setText(arg.join());
    };
    ipcRenderer.on('schemas', schemasListener);

    const analysisListener = (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    };
    ipcRenderer.on('analysis', analysisListener);

    const postSchemaListener = (event, arg) => {
      console.log('postSchemaListener', arg);
      setText(JSON.stringify(arg));
    };
    ipcRenderer.on('schema-post', postSchemaListener);

    const findListener = (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    };
    ipcRenderer.on('find', findListener);
    return () => {
      ipcRenderer.removeListener('asynchronous-reply', replyListener);
      ipcRenderer.removeListener('uri', uriListener);
      ipcRenderer.removeListener('schemas', schemasListener);
      ipcRenderer.removeListener('analysis', analysisListener);
      ipcRenderer.removeListener('schema-post', postSchemaListener);
      ipcRenderer.removeListener('find', findListener);
    };
  }, []);

  return (
    <GenericTemplate title="Test" id="test">
      <div className={classes.root}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => ipcRenderer.send('asynchronous-message', 'ping')}
        >
          Ping
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => changeLanguage()}
        >
          i18n:{t('hello')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => ipcRenderer.send('uri')}
        >
          Mongo URI
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => ipcRenderer.send('schemas')}
        >
          Schemas
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => ipcRenderer.send('analysis')}
        >
          Analysis All
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() =>
            ipcRenderer.send('schema-post', {
              name: 'patients',
              definition: {
                name: {
                  type: 'String',
                },
                age: {
                  type: 'String',
                },
                sex: {
                  type: 'String',
                },
              },
              etc: {
                label: 'Patients',
                icon: 'Person',
                suggests: {
                  sex: ['male', 'female'],
                },
              },
            })
          }
        >
          Post Schema
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() =>
            ipcRenderer.send('find', {
              name: 'projects',
            })
          }
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
