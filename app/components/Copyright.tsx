import React from 'react';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

export default function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://www.as-cube.com/">
        株式会社ASCUBE
      </Link>
      {new Date().getFullYear()}
    </Typography>
  );
}
