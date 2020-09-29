import React from 'react';
import { ipcRenderer } from 'electron';
import Paper from '@material-ui/core/Paper';

import GenericTemplate from '../templates/GenericTemplate';
import ColorTool from '../color/ColorTool';

export default function ColorPage() {
  const onChange = (paletteColors) => {
    console.log('paletteColors', paletteColors);
    ipcRenderer.send('paletteColors', paletteColors);
  };

  return (
    <GenericTemplate title="Color" id="color">
      <Paper square>
        <ColorTool onChange={onChange} />
      </Paper>
    </GenericTemplate>
  );
}
