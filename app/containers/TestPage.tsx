import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';

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
(({ models, callback }) => {
  (async () => {
    console.log('vm start.');

    const rows = await models['${fk.one.table}'].find().lean();
    let many;
    const result = await Promise.all(rows.map(async (p) => {
try {
       many = await models['${fk.many.table}'].find({ '${fk.many.field}': p['${fk.one.field}'] }).lean();
console.log('many:', many);
} catch (err) {
  console.log('err:', err);
}
      return {
        ...p,
        many,
      };
    }));
    console.log('vm end');
    callback(false, result);
  })();
})
`;

export default function TestPage() {
  const classes = useStyles();
  const [text, setText] = useState();
  const { t, i18n } = useTranslation();

  const changeLanguage = () => {
    const getCurrentLng = i18n.language || window.localStorage.i18nextLng || '';

    i18n.changeLanguage(getCurrentLng === 'ja' ? 'en' : 'ja');
  };

  useEffect(() => {
    const queryCodeListener = (event, arg) => {
      console.log(arg);
      setText(JSON.stringify(arg));
    };
    ipcRenderer.on('query-code', queryCodeListener);
    return () => {
      ipcRenderer.removeListener('query-code', findListener);
    };
  }, []);

  return (
    <GenericTemplate title="Test" id="test">
      <div className={classes.root}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            console.log('query-code:', code);
            ipcRenderer.send('query-code', {
              code,
            });
          }}
        >
          Code
        </Button>
        <Typography variant="body1" gutterBottom>
          {text}
        </Typography>
      </div>
    </GenericTemplate>
  );
}
