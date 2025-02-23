import { ipcMain } from 'electron';
import {
    checkDependencies,
    deletePath,
    downloadFile,
    getBuildNumber,
    installDependencies,
    isDockerDesktopInstalled,
    openDockerDesktop,
    release,
} from './functions';

ipcMain.handle('windows.release', release);

ipcMain.handle('windows.getBuildNumber', getBuildNumber);

ipcMain.handle('windows.isDockerDesktopInstalled', isDockerDesktopInstalled);

ipcMain.handle('windows.openDockerDesktop', openDockerDesktop);

ipcMain.handle('windows.downloadFile', downloadFile);

ipcMain.handle('windows.delete', deletePath);

ipcMain.handle('windows.installDependencies', installDependencies);

ipcMain.handle('windows.checkDependencies', checkDependencies);
