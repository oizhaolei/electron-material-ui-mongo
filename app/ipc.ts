import { ipcMain } from 'electron';

export default function ipc (options) {
  ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    event.reply('asynchronous-reply', 'pong');
  });

  ipcMain.on('dbPath', (event, arg) => {
    console.log(arg);
    event.reply('dbPath', options.dbPath);
  });
}
