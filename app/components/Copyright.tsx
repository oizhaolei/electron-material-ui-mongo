import React from 'react';
import { shell } from 'electron';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export default function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Button onClick={() => shell.openExternal('https://www.as-cube.com/')}>
        株式会社ASCUBE
      </Button>
      {new Date().getFullYear()}
    </Typography>
  );
}
