import React, { useState } from 'react';
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

const oneToManyCode = () => {
  const fk = {
    one: {
      table: 'patients',
      field: '患者番号',
    },
    many: {
      table: 'disease',
      field: '患者番号',
    },
  };

  const code = `
(({ models, params, callback }) => {
  (async () => {
    console.log('vm start.');
    try {
      const rows = await models['${fk.one.table}'].find(params).lean();
      const result = await Promise.all(rows.map(async (one) => {
        const many = await models['${fk.many.table}'].find({ '${fk.many.field}': one['${fk.one.field}'] }).lean();
        console.log('many:', many);
        return {
          one,
          many,
        };
      }));
      callback(false, result);
    } catch (err) {
      console.log('err:', err);
      callback(err);
    }
    console.log('vm end');
  })();
})
`;
  return code;
};

const paramsCode = () => {
  const input = [
    '患者番号',
    '採取日',
  ];

  return `
(({ models, params, callback }) => {
  (async () => {
    console.log('vm start.', params);
    try {
      const patient = await models['patients'].findOne({
        '患者番号': params['患者番号'],
      }).lean();
      const diseases = await models['disease'].find({
        '患者番号': patient['患者番号'],
        '採取日': {
          $lte: params['採取日']
        },
      }).lean();
      callback(false, {
        patients: [patient],
        diseases,
      });
    } catch (err) {
      console.log('err:', err);
      callback(err);
    }
    console.log('vm end');
  })();
})
`;
};

// INPUT: 患者番号, 日付, before/after
//
// OUTPUT:
//    patients: one row
//    disease: multi rows

export default function TestPage() {
  const classes = useStyles();
  const [text, setText] = useState();

  return (
    <GenericTemplate title="Test" id="test">
      <div className={classes.root}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            ipcRenderer
              .invoke('query-code', {
                code: oneToManyCode(),
              }).then((data) => {
                console.log(data);
                setText(JSON.stringify(data));
              });
          }}
        >
          One to Many Code
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            ipcRenderer
              .invoke('query-code', {
                code: paramsCode(),
                params: {
                  '患者番号': '04581799',
                  '採取日': '2018/03/10',
                },
              }).then((data) => {
                console.log(data);
                setText(JSON.stringify(data));
              });
          }}
        >
          Pataints Disease Date Code
        </Button>
        <Typography variant="body1" gutterBottom>
          {text}
        </Typography>
      </div>
    </GenericTemplate>
  );
}
