import { ipcMain } from 'electron';
import {
    doesExist,
    doesExistAtProject,
    doesExistAtProjectCodePath,
    editApp,
    execCommandInProject,
    getEnvironmentByProject,
    getPath,
    getProjectsList,
    getSettingsByProject,
    getVersion,
    installApp,
    openFolder,
    openProjectAppDataFolder,
    readProjectFile,
    removeApp,
    renameApp,
    restart,
    showOpenDialog,
    spawnLogsAtProject,
    spawnTerminal,
    spawnTerminalAtProject,
    startProject,
    stopProject,
    updateApp,
} from './functions';

ipcMain.handle('self.restart', restart);

ipcMain.handle('self.getPath', getPath);

ipcMain.handle('self.getVersion', getVersion);

ipcMain.handle('self.showOpenDialog', showOpenDialog);

ipcMain.handle('self.installApp', installApp);

ipcMain.handle('self.editApp', editApp);

ipcMain.handle('self.renameApp', renameApp);

ipcMain.handle('self.updateApp', updateApp);

ipcMain.handle('self.removeApp', removeApp);

ipcMain.handle('self.getProjectsList', getProjectsList);

ipcMain.handle('self.getSettingsByProject', getSettingsByProject);

ipcMain.handle('self.getEnvironmentByProject', getEnvironmentByProject);

ipcMain.handle('self.readProjectFile', readProjectFile);

ipcMain.handle('self.startProject', startProject);

ipcMain.handle('self.stopProject', stopProject);

ipcMain.handle('self.execCommandInProject', execCommandInProject);

ipcMain.handle('self.doesExistAtProjectCodePath', doesExistAtProjectCodePath);

ipcMain.handle('self.doesExistAtProject', doesExistAtProject);

ipcMain.handle('self.doesExist', doesExist);

ipcMain.handle('self.spawnLogsAtProject', spawnLogsAtProject);

ipcMain.handle('self.spawnTerminalAtProject', spawnTerminalAtProject);

ipcMain.handle('self.spawnTerminal', spawnTerminal);

ipcMain.handle('self.openFolder', openFolder);

ipcMain.handle('self.openProjectAppDataFolder', openProjectAppDataFolder);
