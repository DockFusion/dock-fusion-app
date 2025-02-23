import { ipcMain } from 'electron';
import { getAvailableEditors, openPathInEditor } from './functions';

ipcMain.handle('detectEditors.getAvailableEditors', getAvailableEditors);

ipcMain.handle('detectEditors.openPathInEditor', openPathInEditor);
