import React from 'react';
import { ipcRenderer } from 'electron';
import Button from '@material-ui/core/Button';

import GenericTemplate from '../templates/GenericTemplate';

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // prints "pong"
});

export default function Home() {
  return (
    <GenericTemplate title="Test">
      <Button
        variant="contained"
        color="primary"
        onClick={() => ipcRenderer.send('asynchronous-message', 'ping')}
      >
        Hello World
      </Button>
    </GenericTemplate>
  );
}
