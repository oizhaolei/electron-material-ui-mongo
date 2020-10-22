import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

const useStyles = makeStyles((theme) => ({
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Tables() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    ipcRenderer.invoke('dashboard-schemas').then(setSchemas);
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
          {schemas.map((t) => (
            <TableRow key={t.name}>
              <TableCell>
                <Link
                  key={t.name}
                  to={`/table/${t.name}`}
                  className={classes.link}
                >
                  {t.name}
                </Link>
                </TableCell>
              <TableCell align="right">{t.rowCount}</TableCell>
              <TableCell align="right">{t.colCount}</TableCell>
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
