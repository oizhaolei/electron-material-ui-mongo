import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
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

export default function Queries() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    ipcRenderer.invoke('queries').then(setQueries);
  }, []);

  return (
    <>
      <Title>{t('queries')}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('name')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queries.map((q) => (
            <TableRow key={q.name}>
              <TableCell>
                <Link
                  key={q.name}
                  to={`/query/${q.name}`}
                  className={classes.link}
                >
                  {q.name}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
