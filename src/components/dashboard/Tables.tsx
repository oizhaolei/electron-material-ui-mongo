import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

const useStyles = makeStyles((theme) => ({
  link: {
    color: 'inherit',
  },
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Tables() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [err, setErr] = useState('');
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    ipcRenderer
      .invoke('dashboard-schemas')
      .then(setSchemas)
      .catch((e) => setErr(e.toString()));
  }, []);

  return (
    <>
      <Title>{t('tables')}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('name')}</TableCell>
            <TableCell>{t('row count')}</TableCell>
            <TableCell>{t('column count')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schemas.map((s) => (
            <TableRow key={s.name}>
              <TableCell>
                <Link
                  key={s.name}
                  to={`/table/${s.name}`}
                  className={classes.link}
                >
                  {s.name}
                </Link>
              </TableCell>
              <TableCell align="right">{s.rowCount}</TableCell>
              <TableCell align="right">{s.colCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography color="error" variant="body1" gutterBottom>
        {err}
      </Typography>
    </>
  );
}
