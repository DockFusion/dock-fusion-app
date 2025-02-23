import { ipcMain } from 'electron';
import { exec, execSync } from './functions';

ipcMain.handle('child_process.execSync', execSync);

ipcMain.handle('child_process.exec', exec);
