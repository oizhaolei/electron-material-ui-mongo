import { ipcMain } from 'electron';
import ipc from './ipc';

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
  beforeEach(() => {
    ipc();
  });
  it('should attach the eventListeners', () => {
    expect(ipcMain.on.mock.calls[0][0]).toEqual('paletteColors');
    expect(ipcMain.on.mock.calls[1][0]).toEqual('ping');
    expect(ipcMain.on.mock.calls).toHaveLength(3);
  });
});
