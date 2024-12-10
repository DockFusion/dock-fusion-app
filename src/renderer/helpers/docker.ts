import { dockerInstallationDocs } from 'src/shared/constants';
import { openExternal } from './helpers';

export const Docker = {
    info: async () => {
        return await window.electron.docker.info();
    },
    version: async () => {
        return await window.electron.docker.version();
    },
    listContainers: async () => {
        return await window.electron.docker.listContainers();
    },
    inpectContainer: async (containerId: string) => {
        return await window.electron.docker.inpectContainer(containerId);
    },
    isInstalled: async () => {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                resolve(await window.electron.windows.isDockerDesktopInstalled());
            } catch (e) {
                // console.error(e);
                resolve(false);
            }
        });
    },
    isRunning: async () => {
        return new Promise<boolean>(async (resolve, reject) => {
            const dockerInfo = await window.electron.docker.info();
            resolve(dockerInfo ? true : false);
        });
    },
    open: async () => {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await window.electron.windows.openDockerDesktop();

                resolve(true);
            } catch (e) {
                // console.error(e);
                resolve(false);
            }
        });
    },
    openInstallationDocs: () => {
        openExternal(dockerInstallationDocs);
    },
};
