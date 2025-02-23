import { ipcMain } from 'electron';
import { openExternal } from './functions';

ipcMain.handle('shell.openExternal', openExternal);
