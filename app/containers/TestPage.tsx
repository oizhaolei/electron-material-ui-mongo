import React, { useState } from 'react';
import log from 'electron-log';
import { ipcRenderer } from 'electron';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import GenericTemplate from '../templates/GenericTemplate';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const paramsCode = `
(({ models, filter, log, callback }) => {
  (async () => {
    log.info('vm start.', filter);
    try {
      const patient = await models['patient'].findOne({
        '患者番号': filter['患者番号'],
      }).lean();
      const diseases = await models['disease'].find({
        '患者番号': filter['患者番号'],
        '採取日': {
          $lte: filter['採取日']
        },
      }).lean();
      callback(false, {
        patient: [patient],
        diseases,
      });
    } catch (e) {
      log.info('e:', e);
      callback(e);
    }
    log.info('vm end');
  })();
})
`;

// INPUT: 患者番号, 日付, before/after
//
// OUTPUT:
//    patients: one row
//    disease: multi rows

export default function TestPage() {
  const classes = useStyles();
  const [text, setText] = useState();
  const [error, setError] = useState();

  return (
    <GenericTemplate title="Test" id="test">
      <div className={classes.root}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            ipcRenderer
              .invoke('query-code', {
                code: paramsCode,
                filter: {
                  '患者番号': '04581799',
                  '採取日': '2018/03/10',
                },
              }).then((data) => {
                log.info(data);
                setText(JSON.stringify(data));
                setError('');
              })
              .catch((e) => {
                setText('');
                setError(e.toString());
              });
          }}
        >
          Pataints and Disease Code
        </Button>
        <Typography variant="body1" gutterBottom>
        {text}
        </Typography>
        <Typography color="error" variant="body1" gutterBottom>
          {error}
        </Typography>
      </div>
    </GenericTemplate>
  );
}
