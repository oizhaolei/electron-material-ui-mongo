import React, { useState, useEffect, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import {
  ThemeProvider,
  makeStyles,
  createMuiTheme,
} from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import StoreContext from '../store/StoreContext';

import Copyright from '../components/Copyright';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 500,
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
}));

export default function Connection() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [uri, setUri] = useState('');
  const [err, setErr] = useState('');
  const [_, dispatch] = useContext(StoreContext);

  const theme = createMuiTheme({
    palette: {
      type:
        dayjs().format('HH') > '06' && dayjs().format('HH') < '18'
          ? 'light'
          : 'dark',
    },
  });

  const handleConnect = () => {
    ipcRenderer.invoke('connect', uri).then(
      () => {
        dispatch({
          type: 'CONNECTED',
        });
        return history.replace('/');
      },
      (err) => {
        setErr(err);
      }
    );
  };

  useEffect(() => {
    ipcRenderer.invoke('uri').then((u) => {
      setUri(u);
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Connect to database.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="uri"
            label={t('mongo uri')}
            type="text"
            value={uri}
            onChange={(event) => setUri(event.target.value)}
            fullWidth
          />
          <Typography color="error" variant="h5" display="block" gutterBottom>
            {err}
          </Typography>
          <Button onClick={handleConnect} color="primary">
            {t('save')}
          </Button>
        </Paper>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
