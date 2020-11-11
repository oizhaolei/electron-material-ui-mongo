/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import mongoose from 'mongoose';
import { app, dialog, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import windowStateKeeper from 'electron-window-state';
import Rollbar from 'rollbar';

import config from './config';
import MenuBuilder from './menu';
import ipc from './ipc';

// include and initialize the rollbar library with your access token
const rollbar = new Rollbar({
  accessToken: '8cfe586e8a9742ddb42d1d00f7c973c4',
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const createWindow = async () => {
  const dev =
    (process.env.NODE_ENV === 'development' ||
      process.env.E2E_BUILD === 'true') &&
    process.env.ERB_SECURE !== 'true';

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 728,
  });

  const opts = {
    show: false,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      nodeIntegration: dev ? true : undefined,
      preload: dev ? undefined : path.join(__dirname, 'dist/renderer.prod.js'),
    },
  };
  mainWindow = new BrowserWindow(opts);
  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('ready-to-show', () => {
    // IPC
    mongoose.connect(config.mongoose.uri(), config.mongoose.options).then(
      () => {
        ipc();
      },
      (err) => {
        dialog.showErrorBox('Error', 'No MongoDB is not found.');
        throw new Error('No MongoDB is not found.');
      }
    );
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
    mongoose.disconnect();
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
