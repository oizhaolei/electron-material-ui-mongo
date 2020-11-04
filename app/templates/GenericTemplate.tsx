import React, { useState, useEffect, useContext } from 'react';
import Store from 'electron-store';
import { ipcRenderer } from 'electron';
import { Link, useHistory } from 'react-router-dom';
import dayjs from 'dayjs';

import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import {
  ThemeProvider,
  createMuiTheme,
  makeStyles,
  withStyles,
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
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import LockIcon from '@material-ui/icons/Lock';
import HomeIcon from '@material-ui/icons/Home';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsIcon from '@material-ui/icons/Settings';
import TranslateIcon from '@material-ui/icons/Translate';
import PaletteIcon from '@material-ui/icons/Palette';

import Copyright from '../components/Copyright';
import { QueryListItems, TableListItems } from './listItems';
import StoreContext from '../store/StoreContext';

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
  const [{ auth }, dispatch] = useContext(StoreContext);
  const history = useHistory();

  const changeLanguage = () => {
    const getCurrentLng = i18n.language || window.localStorage.i18nextLng || '';

    i18n.changeLanguage(getCurrentLng === 'ja' ? 'en' : 'ja');
  };

  // theme
  const [primary, setPrimary] = useState(
    store.get('palette.primary', {
      main: '#3f50b5',
    })
  );
  const [secondary, setSecondary] = useState(
    store.get('palette.secondary', {
      main: '#f44336',
    })
  );

  const theme = createMuiTheme({
    palette: {
      primary,
      secondary,
      type:
        dayjs().format('HH') > '06' && dayjs().format('HH') < '18'
          ? 'light'
          : 'dark',
    },
  });

  // menu open
  const [open, setOpen] = useState(store.get('drawer.open', true));
  const handleDrawerOpen = () => {
    setOpen(true);
    store.set('drawer.open', true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
    store.set('drawer.open', false);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      history.replace('/pincode');
    }
  }, [auth]);

  useEffect(() => {
    const paletteColorsListener = (event, arg) => {
      setPrimary(arg.primary);
      store.set('palette.primary', arg.primary);
      setSecondary(arg.secondary);
      store.set('palette.secondary', arg.secondary);
    };
    ipcRenderer.on('paletteColors', paletteColorsListener);

    return () => {
      ipcRenderer.removeListener('paletteColors', paletteColorsListener);
    };
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, false)}>
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
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleDrawerClose}
              className={clsx(
                classes.menuButton,
                !open && classes.menuButtonHidden
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
              {t('personal db')}
            </Typography>
            <Tooltip title={t('Toggle en/ja language')}>
              <IconButton color="inherit" onClick={changeLanguage}>
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('Setting')}>
              <Link to="/setting" className={classes.link}>
                <IconButton color="inherit">
                  <SettingsIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title={t('Change Colors')}>
              <Link to="/color" className={classes.link}>
                <IconButton color="inherit">
                  <PaletteIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title={t('Lock Screen')}>
              <IconButton
                color="inherit"
                onClick={() =>
                  dispatch({
                    type: 'SIGNOUT',
                  })
                }
              >
                <LockIcon />
              </IconButton>
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
            <IconButton />
          </div>
          <Divider />
          <List>
            <Link to="/" className={classes.link}>
              <ListItem button selected={id === 'dashboard'}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary={t('dashboard')} />
              </ListItem>
            </Link>
          </List>
          <Divider />
          <List>
            <TableListItems current={id} />
          </List>
          <Divider />
          <List>
            <QueryListItems current={id} />
          </List>
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth={false} className={classes.container}>
            {title && (
              <Typography
                component="h2"
                variant="h5"
                color="inherit"
                noWrap
                className={classes.pageTitle}
              >
                {title}
              </Typography>
            )}
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
