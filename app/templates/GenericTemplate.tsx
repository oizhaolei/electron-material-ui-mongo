import React, { useState, useEffect } from 'react';
import Store from 'electron-store';
import { ipcRenderer } from 'electron';

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
import { Link } from 'react-router-dom';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import TranslateIcon from '@material-ui/icons/Translate';
import PaletteIcon from '@material-ui/icons/Palette';
import AddIcon from '@material-ui/icons/Add';
import Badge from '@material-ui/core/Badge';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GridOnIcon from '@material-ui/icons/GridOn';
import FindInPageIcon from '@material-ui/icons/FindInPage';

import Copyright from '../components/Copyright';
import { QueryListItems, TableListItems } from './listItems';

const store = new Store();
const drawerWidth = 240;


const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);


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

  // theme
  const [darkMode, setDarkMode] = useState(store.get('darkMode', 'light'));
  const toggleDarkMode = () => {
    const newDarkMode = darkMode === 'light' ? 'dark' : 'light';
    store.set('darkMode', newDarkMode);
    setDarkMode(newDarkMode);
  };
  const [primary, setPrimary] = useState(
    store.get('primary', {
      main: '#3f50b5',
    })
  );
  const [secondary, setSecondary] = useState(
    store.get('secondary', {
      main: '#f44336',
    })
  );

  const theme = createMuiTheme({
    palette: {
      primary,
      secondary,
      type: darkMode,
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

  const [anchorEl, setAnchorEl] = useState(null);
  const handleAddClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddClose = () => {
    setAnchorEl(null);
  };
  const addActions = [
    {
      icon: <GridOnIcon fontSize="small" />,
      name: t('Add Table'),
      link: '/schema-wizard',
    },
    {
      icon: <FindInPageIcon fontSize="small" />,
      name: t('Add Query'),
      link: '/query-wizard',
    },
  ];



  useEffect(() => {
    const paletteColorsListener = (event, arg) => {
      setPrimary(arg.primary);
      store.set('primary', arg.primary);
      setSecondary(arg.secondary);
      store.set('secondary', arg.secondary);
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
              {t('personal.db')}
            </Typography>
            <Tooltip title="Add">
              <IconButton color="inherit" onClick={handleAddClick}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle en/ja language">
              <IconButton color="inherit" onClick={changeLanguage}>
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle dard/light theme">
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode === 'dark' ? (
                  <Brightness7Icon />
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Change Colors">
              <Link to="/color" className={classes.link}>
                <IconButton color="inherit">
                  <PaletteIcon />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title="System Update">
              <IconButton color="inherit">
                <Badge color="secondary" variant="dot">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Toolbar>
          <StyledMenu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleAddClose}
          >
            {
              addActions.map((a) => (
                <Link key={a.link} to={a.link} className={classes.link}>
                  <MenuItem>
                    <ListItemIcon>
                      {a.icon}
                    </ListItemIcon>
                    <ListItemText primary={a.name} />
                  </MenuItem>
                </Link>
              ))
            }
          </StyledMenu>
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
              <ListItem button>
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
            {
              title && (
                <Typography
                  component="h2"
                  variant="h5"
                  color="inherit"
                  noWrap
                  className={classes.pageTitle}
                >
                  {title}
                </Typography>
              )
            }
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
