import { ipcMain } from 'electron';
import { getAvailableShells } from './functions';

ipcMain.handle('detectShells.getAvailableShells', getAvailableShells);
