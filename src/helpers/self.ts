import { OpenDialogOptions } from 'electron';
import { IInstallAppSettings, IMarketplaceItem, IProject } from 'src/shared/interfaces';

export const Self = {
    restart: async () => {
        return await window.electron.self.restart();
    },
    getPath: async (
        name:
            | 'home'
            | 'appData'
            | 'userData'
            | 'sessionData'
            | 'temp'
            | 'exe'
            | 'module'
            | 'desktop'
            | 'documents'
            | 'downloads'
            | 'music'
            | 'pictures'
            | 'videos'
            | 'recent'
            | 'logs'
            | 'crashDumps',
    ) => {
        return await window.electron.self.getPath(name);
    },
    getVersion: async () => {
        return await window.electron.self.getVersion();
    },
    showOpenDialog: async (options: OpenDialogOptions) => {
        return await window.electron.self.showOpenDialog(options);
    },
    installApp: async (options: IInstallAppSettings[], marketplaceItem: IMarketplaceItem) => {
        return await window.electron.self.installApp(options, marketplaceItem);
    },
    getProjectsList: async () => {
        return await window.electron.self.getProjectsList();
    },
    getSettingsByProject: async (project: IProject) => {
        return await window.electron.self.getSettingsByProject(project);
    },
    getEnvironmentByProject: async (project: IProject) => {
        return await window.electron.self.getEnvironmentByProject(project);
    },
    readProjectFile: async (project: IProject, filePath: string) => {
        return await window.electron.self.readProjectFile(project, filePath);
    },
    startProject: async (project: IProject, forceRebuild?: boolean) => {
        return await window.electron.self.startProject(project, forceRebuild);
    },
    stopProject: async (project: IProject) => {
        return await window.electron.self.stopProject(project);
    },
    doesExist: async (targetPath: string) => {
        return await window.electron.self.doesExist(targetPath);
    },
    doesExistAtProject: async (project: IProject, targetPath: string) => {
        return await window.electron.self.doesExistAtProject(project, targetPath);
    },
    execCommandInProject: async (containerId: string, command: string) => {
        return await window.electron.self.execCommandInProject(containerId, command);
    },
    updateApp: async (project: IProject) => {
        return await window.electron.self.updateApp(project);
    },
    removeApp: async (project: IProject) => {
        return await window.electron.self.removeApp(project);
    },
};
