import { OpenDialogOptions } from 'electron';
import { IInstallAppSettings, IMarketplaceItem, IProject } from 'shared/interfaces';

/**
 * The preload script runs before `index.html` is loaded
 * in the renderer. It has access to web APIs as well as
 * Electron's renderer process modules and some polyfilled
 * Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: any, text: any) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});

contextBridge.exposeInMainWorld('electron', {
    childProcess: {
        execSync: async (command: any) => await ipcRenderer.invoke('child_process.execSync', command),
        exec: async (command: any, callback: any) => ipcRenderer.invoke('child_process.exec', command, callback),
    },
    docker: {
        info: async () => await ipcRenderer.invoke('dockerode.info'),
        version: async () => await ipcRenderer.invoke('dockerode.version'),
        listContainers: async () => await ipcRenderer.invoke('dockerode.listContainers'),
        inpectContainer: async (containerId: string) =>
            await ipcRenderer.invoke('dockerode.inpectContainer', containerId),
    },
    windows: {
        isDockerDesktopInstalled: async () => await ipcRenderer.invoke('windows.isDockerDesktopInstalled'),
        openDockerDesktop: async () => await ipcRenderer.invoke('windows.openDockerDesktop'),
        release: async () => await ipcRenderer.invoke('windows.release'),
        getBuildNumber: async () => await ipcRenderer.invoke('windows.getBuildNumber'),
        downloadFile: async (url: string, downloadPath?: string, outputFileName?: string) =>
            await ipcRenderer.invoke('windows.downloadFile', url, downloadPath, outputFileName),
        delete: async (deletePath: string) => await ipcRenderer.invoke('windows.delete', deletePath),
        installDependencies: async () => await ipcRenderer.invoke('windows.installDependencies'),
        checkDependencies: async () => await ipcRenderer.invoke('windows.checkDependencies'),
    },
    wsl: {
        getStatus: async () => await ipcRenderer.invoke('wsl.getStatus'),
        getDistributions: async () => await ipcRenderer.invoke('wsl.getDistributions'),
        install: async () => await ipcRenderer.invoke('wsl.install'),
        setDefault: async (distribution: string) => await ipcRenderer.invoke('wsl.setDefault', distribution),
        import: async (distributionName: string, distributionPath: string, fileToImportPath: string) =>
            await ipcRenderer.invoke('wsl.import', distributionName, distributionPath, fileToImportPath),
    },
    shell: {
        openExternal: async (url: string, options?: Electron.OpenExternalOptions) =>
            await ipcRenderer.invoke('shell.openExternal', url, options),
    },
    detectEditors: {
        getAvailableEditors: async () => await ipcRenderer.invoke('detectEditors.getAvailableEditors'),
    },
    detectShells: {
        getAvailableShells: async () => await ipcRenderer.invoke('detectShells.getAvailableShells'),
    },
    self: {
        restart: async () => await ipcRenderer.invoke('self.restart'),
        getPath: async (name: string) => await ipcRenderer.invoke('self.getPath', name),
        getVersion: async () => await ipcRenderer.invoke('self.getVersion'),
        showOpenDialog: async (options: OpenDialogOptions) => await ipcRenderer.invoke('self.showOpenDialog', options),
        installApp: async (options: IInstallAppSettings[], marketplaceItem: IMarketplaceItem) =>
            await ipcRenderer.invoke('self.installApp', options, marketplaceItem),
        getProjectsList: async () => await ipcRenderer.invoke('self.getProjectsList'),
        getSettingsByProject: async (project: IProject) =>
            await ipcRenderer.invoke('self.getSettingsByProject', project),
        getEnvironmentByProject: async (project: IProject) =>
            await ipcRenderer.invoke('self.getEnvironmentByProject', project),
        readProjectFile: async (project: IProject, filePath: string) =>
            await ipcRenderer.invoke('self.readProjectFile', project, filePath),
        startProject: async (project: IProject, forceRebuild?: boolean) =>
            await ipcRenderer.invoke('self.startProject', project, forceRebuild),
        stopProject: async (project: IProject) => await ipcRenderer.invoke('self.stopProject', project),
        doesExist: async (targetPath: string) => await ipcRenderer.invoke('self.doesExist', targetPath),
        doesExistAtProject: async (project: IProject, targetPath: string) =>
            await ipcRenderer.invoke('self.doesExistAtProject', project, targetPath),
        execCommandInProject: async (containerId: string, command: string) =>
            await ipcRenderer.invoke('self.execCommandInProject', containerId, command),
        updateApp: async (project: IProject) => await ipcRenderer.invoke('self.updateApp', project),
        removeApp: async (project: IProject) => await ipcRenderer.invoke('self.removeApp', project),
        spawnTerminal: async (command: string) => await ipcRenderer.invoke('self.spawnTerminal', command),
        spawnTerminalAtProject: async (project: IProject, command: string) =>
            await ipcRenderer.invoke('self.spawnTerminalAtProject', project, command),
        spawnLogsAtProject: async (project: IProject) => await ipcRenderer.invoke('self.spawnLogsAtProject', project),
    },
    github: {
        downloadMarketplaceFile: async (downloadUrl: string, github: string, filePath: string) =>
            await ipcRenderer.invoke('github.downloadMarketplaceFile', downloadUrl, github, filePath),
        readMarketplaceFile: async (github: string, filePath: string) =>
            await ipcRenderer.invoke('github.readMarketplaceFile', github, filePath),
    },
    api: {
        send: (channel: string, data: any) => {
            ipcRenderer.send(channel, data);
        },
        on: (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
            ipcRenderer.on(channel, func);
        },
        off: (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
            ipcRenderer.off(channel, func);
        },
    },
});
