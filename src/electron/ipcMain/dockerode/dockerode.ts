import { ipcMain } from 'electron';
import { info, inpectContainer, listContainers, version } from './functions';

ipcMain.handle('dockerode.info', info);

ipcMain.handle('dockerode.version', version);

ipcMain.handle('dockerode.listContainers', listContainers);

ipcMain.handle('dockerode.inpectContainer', inpectContainer);
