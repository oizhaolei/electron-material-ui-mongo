import React, { useState } from 'react';
import Store from 'electron-store';

import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  createStyles,
} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Container from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import TranslateIcon from '@material-ui/icons/Translate';
import InvertColorsIcon from '@material-ui/icons/InvertColors';
import Badge from '@material-ui/core/Badge';

import Copyright from '../components/Copyright';
import { MainListItems, SecondaryListItems } from './listItems';

const store = new Store();
const drawerWidth = 240;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    toolbar: {
      paddingRight: 24,
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    menuButtonHidden: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
    pageTitle: {
      marginBottom: theme.spacing(1),
    },
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    link: {
      textDecoration: 'none',
      color: 'inherit',
    },
  })
);

const GenericTemplate = ({ children, title, id }) => {
  const classes = useStyles();

  const { t, i18n } = useTranslation();
  const changeLanguage = () => {
    const getCurrentLng = i18n.language || window.localStorage.i18nextLng || '';

    i18n.changeLanguage(getCurrentLng === 'ja' ? 'en' : 'ja');
  };
  const changeColor = () => {
  };

  // theme
  const [darkMode, setDarkMode] = useState(store.get('darkMode', false));
  const handleDarkModeOn = () => {
    store.set('darkMode', true);
    setDarkMode(true);
  };
  const handleDarkModeOff = () => {
    store.set('darkMode', false);
    setDarkMode(false);
  };

  const theme = createMuiTheme({
    palette: {
      primary: {
        light: '#757ce8',
        main: '#3f50b5',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
      type: darkMode ? 'dark' : 'light',
    },
  });

  // menu open
  const [open, setOpen] = useState(store.get('open', true));
  const handleDrawerOpen = () => {
    setOpen(true);
    store.set('open', true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
    store.set('open', false);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="absolute"
          className={clsx(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleDrawerOpen}
              className={clsx(
                classes.menuButton,
                open && classes.menuButtonHidden
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {t('パソナールDB')}
            </Typography>
            <Tooltip title="Toggle en/ja language">
              <IconButton color="inherit" onClick={() => changeLanguage()}>
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle dard/light theme">
              <IconButton
                color="inherit"
                onClick={darkMode ? handleDarkModeOff : handleDarkModeOn}
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Change Colors">
              <Link to="/color" className={classes.link}>
                <IconButton color="inherit" onClick={() => changeColor()}>
                  <InvertColorsIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title="System Update">
              <Badge color="secondary" variant="dot">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Badge>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <Link to="/" className={classes.link}>
              <ListItem button>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="トップページ" />
              </ListItem>
            </Link>
          </List>
          <Divider />
          <List>
            <SecondaryListItems current={id} />
          </List>
          <Divider />
          <List>
            <MainListItems />
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>
            <Typography
              component="h2"
              variant="h5"
              color="inherit"
              noWrap
              className={classes.pageTitle}
            >
              {title}
            </Typography>
            {children}
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default GenericTemplate;
