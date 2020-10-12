import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';

import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Tables() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    setSchemas(ipcRenderer.sendSync('dashboard-schemas', { sync: true }));
  }, []);

  return (
    <>
      <Title>{t('Tables')}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('Name')}</TableCell>
            <TableCell>{t('Row Count')}</TableCell>
            <TableCell>{t('Column Count')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schemas.map((schema) => (
            <TableRow key={schema.name}>
              <TableCell>{schema.name}</TableCell>
              <TableCell align="right">{schema.rowCount}</TableCell>
              <TableCell align="right">{schema.colCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={classes.seeMore}>
        <Button>See more</Button>
      </div>
    </>
  );
}
