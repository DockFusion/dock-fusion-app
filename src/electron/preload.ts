const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    childProcess: {
        execSync: async (...args: any[]) => await ipcRenderer.invoke('child_process.execSync', ...args),
        exec: async (...args: any[]) => ipcRenderer.invoke('child_process.exec', ...args),
    },
    docker: {
        info: async (...args: any[]) => await ipcRenderer.invoke('dockerode.info', ...args),
        version: async (...args: any[]) => await ipcRenderer.invoke('dockerode.version', ...args),
        listContainers: async (...args: any[]) => await ipcRenderer.invoke('dockerode.listContainers', ...args),
        inpectContainer: async (...args: any[]) => await ipcRenderer.invoke('dockerode.inpectContainer', ...args),
    },
    windows: {
        isDockerDesktopInstalled: async (...args: any[]) =>
            await ipcRenderer.invoke('windows.isDockerDesktopInstalled', ...args),
        openDockerDesktop: async (...args: any[]) => await ipcRenderer.invoke('windows.openDockerDesktop', ...args),
        release: async (...args: any[]) => await ipcRenderer.invoke('windows.release', ...args),
        getBuildNumber: async (...args: any[]) => await ipcRenderer.invoke('windows.getBuildNumber', ...args),
        downloadFile: async (...args: any[]) => await ipcRenderer.invoke('windows.downloadFile', ...args),
        delete: async (...args: any[]) => await ipcRenderer.invoke('windows.delete', ...args),
        installDependencies: async (...args: any[]) => await ipcRenderer.invoke('windows.installDependencies', ...args),
        checkDependencies: async (...args: any[]) => await ipcRenderer.invoke('windows.checkDependencies', ...args),
    },
    wsl: {
        getStatus: async (...args: any[]) => await ipcRenderer.invoke('wsl.getStatus', ...args),
        getDistributions: async (...args: any[]) => await ipcRenderer.invoke('wsl.getDistributions', ...args),
        install: async (...args: any[]) => await ipcRenderer.invoke('wsl.install', ...args),
        setDefault: async (...args: any[]) => await ipcRenderer.invoke('wsl.setDefault', ...args),
        import: async (...args: any[]) => await ipcRenderer.invoke('wsl.import', ...args),
    },
    shell: {
        openExternal: async (...args: any[]) => await ipcRenderer.invoke('shell.openExternal', ...args),
    },
    detectEditors: {
        getAvailableEditors: async (...args: any[]) =>
            await ipcRenderer.invoke('detectEditors.getAvailableEditors', ...args),
    },
    detectShells: {
        getAvailableShells: async (...args: any[]) =>
            await ipcRenderer.invoke('detectShells.getAvailableShells', ...args),
    },
    self: {
        restart: async (...args: any[]) => await ipcRenderer.invoke('self.restart', ...args),
        getPath: async (...args: any[]) => await ipcRenderer.invoke('self.getPath', ...args),
        getVersion: async (...args: any[]) => await ipcRenderer.invoke('self.getVersion', ...args),
        showOpenDialog: async (...args: any[]) => await ipcRenderer.invoke('self.showOpenDialog', ...args),
        installApp: async (...args: any[]) => await ipcRenderer.invoke('self.installApp', ...args),
        editApp: async (...args: any[]) => await ipcRenderer.invoke('self.editApp', ...args),
        getProjectsList: async (...args: any[]) => await ipcRenderer.invoke('self.getProjectsList', ...args),
        getSettingsByProject: async (...args: any[]) => await ipcRenderer.invoke('self.getSettingsByProject', ...args),
        getEnvironmentByProject: async (...args: any[]) =>
            await ipcRenderer.invoke('self.getEnvironmentByProject', ...args),
        readProjectFile: async (...args: any[]) => await ipcRenderer.invoke('self.readProjectFile', ...args),
        startProject: async (...args: any[]) => await ipcRenderer.invoke('self.startProject', ...args),
        stopProject: async (...args: any[]) => await ipcRenderer.invoke('self.stopProject', ...args),
        doesExist: async (...args: any[]) => await ipcRenderer.invoke('self.doesExist', ...args),
        doesExistAtProjectCodePath: async (...args: any[]) =>
            await ipcRenderer.invoke('self.doesExistAtProjectCodePath', ...args),
        doesExistAtProject: async (...args: any[]) => await ipcRenderer.invoke('self.doesExistAtProject', ...args),
        execCommandInProject: async (...args: any[]) => await ipcRenderer.invoke('self.execCommandInProject', ...args),
        renameApp: async (...args: any[]) => await ipcRenderer.invoke('self.renameApp', ...args),
        updateApp: async (...args: any[]) => await ipcRenderer.invoke('self.updateApp', ...args),
        removeApp: async (...args: any[]) => await ipcRenderer.invoke('self.removeApp', ...args),
        spawnTerminal: async (...args: any[]) => await ipcRenderer.invoke('self.spawnTerminal', ...args),
        spawnTerminalAtProject: async (...args: any[]) =>
            await ipcRenderer.invoke('self.spawnTerminalAtProject', ...args),
        spawnLogsAtProject: async (...args: any[]) => await ipcRenderer.invoke('self.spawnLogsAtProject', ...args),
        openFolder: async (...args: any[]) => await ipcRenderer.invoke('self.openFolder', ...args),
        openProjectAppDataFolder: async (...args: any[]) =>
            await ipcRenderer.invoke('self.openProjectAppDataFolder', ...args),
    },
    github: {
        downloadMarketplaceFile: async (...args: any[]) =>
            await ipcRenderer.invoke('github.downloadMarketplaceFile', ...args),
        readMarketplaceFile: async (...args: any[]) => await ipcRenderer.invoke('github.readMarketplaceFile', ...args),
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
