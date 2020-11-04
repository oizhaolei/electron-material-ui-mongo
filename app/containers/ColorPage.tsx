import React from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

import Paper from '@material-ui/core/Paper';

import GenericTemplate from '../templates/GenericTemplate';
import ColorTool from '../components/color/ColorTool';

export default function ColorPage() {
  const { t } = useTranslation();

  const onChange = (paletteColors) => {
    ipcRenderer.send('paletteColors', paletteColors);
  };

  return (
    <GenericTemplate title={t('Color')} id="color">
      <Paper square>
        <ColorTool onChange={onChange} />
      </Paper>
    </GenericTemplate>
  );
}
