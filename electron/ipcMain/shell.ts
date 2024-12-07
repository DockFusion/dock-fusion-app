import { ipcMain, shell } from 'electron';

ipcMain.handle('shell.openExternal', async function (_: any, url: string, options?: Electron.OpenExternalOptions) {
    shell.openExternal(url, options);
});
