import { ipcMain } from 'electron';
import { downloadMarketplaceFile, readMarketplaceFile } from './functions';

ipcMain.handle('github.downloadMarketplaceFile', downloadMarketplaceFile);

ipcMain.handle('github.readMarketplaceFile', readMarketplaceFile);
