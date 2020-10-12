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

export default function Queries() {
  const classes = useStyles();
  const { t } = useTranslation();
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    setQueries(ipcRenderer.sendSync('queries', { sync: true }));
  }, []);

  return (
    <>
      <Title>{t('Queries')}</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('Name')}</TableCell>
            <TableCell>{t('Main Table')}</TableCell>
            <TableCell>{t('Detail Table')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queries.map((query) => (
            <TableRow key={query.name}>
              <TableCell>{query.name}</TableCell>
              <TableCell>{`${query.relations.one.table}.${query.relations.one.field}`}</TableCell>
              <TableCell>{`${query.relations.many.table}.${query.relations.many.field}`}</TableCell>
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
