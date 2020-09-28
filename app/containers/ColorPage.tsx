import React from 'react';
import Paper from '@material-ui/core/Paper';

import GenericTemplate from '../templates/GenericTemplate';
import ColorTool from '../color/ColorTool';

export default function SimpleTabs() {
  return (
    <GenericTemplate title="Color" id="color">
      <Paper square>
        <ColorTool />
      </Paper>
    </GenericTemplate>
  );
}
