import Dockerode from 'dockerode';
import { ipcMain } from 'electron';

const docker = new Dockerode({});

ipcMain.handle('dockerode.info', async function () {
    try {
        return await docker.info();
    } catch (e) {
        return null;
    }
});

ipcMain.handle('dockerode.version', async function (): Promise<Dockerode.DockerVersion | null> {
    try {
        return await docker.version();
    } catch (e) {
        return null;
    }
});

ipcMain.handle('dockerode.listContainers', async function (): Promise<Dockerode.ContainerInfo[]> {
    try {
        return await docker.listContainers({ all: true });
    } catch (e) {
        return [];
    }
});

ipcMain.handle(
    'dockerode.inpectContainer',
    async function (_: any, containerId: string): Promise<Dockerode.ContainerInspectInfo | null> {
        try {
            const container = docker.getContainer(containerId);
            return await container.inspect();
        } catch (e) {
            return null;
        }
    },
);
