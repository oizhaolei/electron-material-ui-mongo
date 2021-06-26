import { ipcMain } from 'electron';
import Ipc from './ipc';

jest.mock(
  'electron',
  () => {
    const mockIpcMain = {
      on: jest.fn().mockReturnThis(),
    };
    return { ipcMain: mockIpcMain };
  },
  { virtual: true }
);

describe('Should test the ipcMain events', () => {
  let component;
  beforeEach(() => {
    component = new Ipc();
  });
  it('should attach the eventListeners', () => {
    expect(ipcMain.on.mock.calls[0][0]).toEqual('paletteColors');
    expect(ipcMain.on.mock.calls[1][0]).toEqual('ping');
    expect(ipcMain.on.mock.calls[2][0]).toEqual('tables');
    expect(ipcMain.on.mock.calls).toHaveLength(3);
  });
});
