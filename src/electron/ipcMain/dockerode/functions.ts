import Dockerode from 'dockerode';

const docker = new Dockerode({});

export async function info() {
    try {
        return await docker.info();
    } catch (e) {
        return null;
    }
}

export async function version(): Promise<Dockerode.DockerVersion | null> {
    try {
        return await docker.version();
    } catch (e) {
        return null;
    }
}

export async function listContainers(): Promise<Dockerode.ContainerInfo[]> {
    try {
        return await docker.listContainers({ all: true });
    } catch (e) {
        return [];
    }
}

export async function inpectContainer(_: any, containerId: string): Promise<Dockerode.ContainerInspectInfo | null> {
    try {
        const container = docker.getContainer(containerId);
        return await container.inspect();
    } catch (e) {
        return null;
    }
}
