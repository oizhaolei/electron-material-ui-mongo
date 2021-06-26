import React from 'react';
import { shell } from 'electron';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export default function Copyright() {
  const { t } = useTranslation();
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Button onClick={() => shell.openExternal('https://www.as-cube.com/')}>
        {t('company name')}
      </Button>
      {new Date().getFullYear()}
    </Typography>
  );
}
