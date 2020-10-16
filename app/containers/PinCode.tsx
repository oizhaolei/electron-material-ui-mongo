import React, { useState, useEffect, useContext } from 'react';
import Store from 'electron-store';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

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
import ReactCodeInput from 'react-code-input';

import StoreContext from '../store/StoreContext';

import Copyright from '../components/Copyright';

const store = new Store();

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

const PINCODE_LENGTH = 4;

export default function PinCode() {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const [value, setValue] = useState('');
  const [{ auth }, dispatch] = useContext(StoreContext);

  // theme
  const [darkMode] = useState(store.get('darkMode', 'light'));

  useEffect(() => {
    if (auth.isAuthenticated) {
      history.replace('/');
    }
  }, [auth]);

  const theme = createMuiTheme({
    palette: {
      type: darkMode,
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {t('Input Pincode to Login')}
          </Typography>
          <ReactCodeInput
            type="password"
            value={value}
            fields={PINCODE_LENGTH}
            onChange={(v) => {
              setValue(v);
              if (v.length === PINCODE_LENGTH) {
                dispatch({
                  type: 'AUTHENTICATE',
                  payload: {
                    value,
                  },
                });
              }
            }}
          />
          <Typography
            color="error"
            variant="h5"
            display="block"
            gutterBottom
          >
            {auth.error}
          </Typography>
        </Paper>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
