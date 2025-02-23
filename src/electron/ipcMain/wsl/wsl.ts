import { ipcMain } from 'electron';
import { getDistributions, getStatus, importDistribution, install, setDefault } from './functions';

ipcMain.handle('wsl.getStatus', getStatus);

ipcMain.handle('wsl.getDistributions', getDistributions);

ipcMain.handle('wsl.install', install);

ipcMain.handle('wsl.setDefault', setDefault);

ipcMain.handle('wsl.import', importDistribution);
