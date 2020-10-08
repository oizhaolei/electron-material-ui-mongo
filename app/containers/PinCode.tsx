import React, { useState } from 'react';
import Store from 'electron-store';
import { useHistory } from "react-router-dom";

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
import ReactCodeInput from 'react-code-input';

import Copyright from '../components/Copyright';

const store = new Store();

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
}));

const PINCODE_LENGTH = 4;

export default function PinCode() {
  const classes = useStyles();
  const history = useHistory();

  // theme
  const [darkMode] = useState(store.get('darkMode', 'light'));
  const theme = createMuiTheme({
    palette: {
      type: darkMode,
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Input Pincode to Login
          </Typography>
          <ReactCodeInput
            type="password"
            fields={PINCODE_LENGTH}
            onChange={(value) => {
              if (value.length === PINCODE_LENGTH) {
                history.replace('/');
              }
            }}
          />
        </div>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
