import { exec, spawn } from 'child_process';
import Dockerode from 'dockerode';
import { app, dialog, ipcMain, OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import fs from 'fs';
import path from 'path';
import { dockerGroupName, homeAppDataFolderName } from 'src/shared/constants';
import { IInstallAppSettings, IMarketplaceItem, IProject } from 'src/shared/interfaces';
import {
    addDNSResolver,
    checkCertificate,
    createAndInstallCertificate,
    decompressZip,
    doesExist,
    getContainerStatus,
    listFolders,
    moveContentsAndRemoveFolder,
    readEnvFile,
    readFromFile,
    readJson,
    readYaml,
    saveJson,
    saveYaml,
    sleep,
    writeEnvFile,
    writeToFile,
} from '../utils';
const getPort = require('get-ports');

const docker = new Dockerode({});
let currentStartPosition = 0;
let processingPosition = 0;

ipcMain.handle('self.restart', async function () {
    app.relaunch();
    app.exit();
});

ipcMain.handle(
    'self.getPath',
    async function (
        _: any,
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
    ) {
        return app.getPath(name);
    },
);

ipcMain.handle('self.getVersion', async function (_: any) {
    let version = '';
    if (app.isPackaged) {
        version = app.getVersion();
    } else {
        version = require('@/package.json').version;
    }
    return version;
});

ipcMain.handle(
    'self.showOpenDialog',
    async function (_: any, options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
        const result = await dialog.showOpenDialog(options);

        return result;
    },
);

ipcMain.handle(
    'self.installApp',
    async function (
        _: any,
        options: IInstallAppSettings[],
        marketplaceItem: IMarketplaceItem,
    ): Promise<string | boolean> {
        const homePath = app.getPath('home');
        let dockFusionPath = path.join(homePath, homeAppDataFolderName);
        let appDataPath = path.join(dockFusionPath, 'apps');
        let dataPath = path.join(dockFusionPath, 'data');
        let env: any = {};
        let systemEnv: any = {};
        let domain = '';
        let projectLabel = null;

        for (const option of options) {
            if (option.type === 'domain') {
                appDataPath = path.join(appDataPath, option.value);
                dataPath = path.join(dataPath, option.value);
                domain = option.value;
            } else if (option.type === 'project-label') {
                projectLabel = option.value;
            }
            if (domain !== '' && projectLabel !== null) {
                break;
            }
        }

        let projects: IProject[] = [];
        try {
            projects = await readJson(path.join(dockFusionPath, 'projects.json'));
        } catch (e) {}

        if (projects.find((el) => el.domain == domain)) {
            const error = `There is already a project named: ${domain}`;
            console.error(error);
            return error;
        }

        projects.push({
            label: projectLabel,
            domain: domain,
            appId: marketplaceItem.id,
            github: marketplaceItem.github,
        });

        const githubProjectLocalPath = path.join(app.getPath('userData'), 'githubDownloads', marketplaceItem.github);
        const githubFileLocalPath = path.join(githubProjectLocalPath, 'source.zip');
        const githubVersionFileLocalPath = path.join(githubProjectLocalPath, 'version');

        const sourceZipFile = path.join(appDataPath, 'source.zip');
        const versionFile = path.join(appDataPath, 'version');
        //make sure it is a clean installation
        fs.rmSync(appDataPath, { recursive: true, force: true });
        fs.mkdirSync(appDataPath, { recursive: true });
        fs.copyFileSync(githubFileLocalPath, sourceZipFile);

        decompressZip(sourceZipFile, appDataPath);

        fs.rmSync(sourceZipFile, { force: true });

        moveContentsAndRemoveFolder(path.join(appDataPath, listFolders(appDataPath)[0]), appDataPath);

        fs.copyFileSync(githubVersionFileLocalPath, versionFile);
        env = readEnvFile(path.join(appDataPath, '.env'));
        for (const option of options) {
            if (option.target) {
                env[option.target] = option.value;
            } else {
                switch (option.type) {
                    case 'path-select':
                        systemEnv['APP_CODE_PATH_HOST'] = option.value;
                        break;

                    case 'db-credentials':
                        systemEnv['DB_NAME'] = option.value.database;
                        systemEnv['DB_USER'] = option.value.user;
                        systemEnv['DB_PASSWORD'] = option.value.password;
                        systemEnv['DB_ROOT_PASSWORD'] = option.value.password;
                        break;
                }
            }
        }
        env.DATA_PATH_HOST = dataPath;

        env = {
            ...env,
            ...systemEnv,
        };

        writeEnvFile(path.join(appDataPath, '.env'), env);

        await saveJson(path.join(dockFusionPath, 'projects.json'), projects);

        return true;
    },
);

ipcMain.handle('self.updateApp', async function (_: any, project: IProject): Promise<string | boolean> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appUpdateBackupPath = path.join(dockFusionPath, 'update-backup', project.domain);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);
    let env: any = readEnvFile(path.join(appDataPath, '.env'));

    fs.mkdirSync(path.join(dockFusionPath, 'update-backup'), { recursive: true });
    fs.rmSync(appUpdateBackupPath, { recursive: true, force: true });
    fs.renameSync(appDataPath, appUpdateBackupPath);

    try {
        const githubProjectLocalPath = path.join(app.getPath('userData'), 'githubDownloads', project.github);
        const githubFileLocalPath = path.join(githubProjectLocalPath, 'source.zip');
        const githubVersionFileLocalPath = path.join(githubProjectLocalPath, 'version');

        const sourceZipFile = path.join(appDataPath, 'source.zip');
        const versionFile = path.join(appDataPath, 'version');
        //make sure it is a clean installation
        fs.rmSync(appDataPath, { recursive: true, force: true });
        fs.mkdirSync(appDataPath, { recursive: true });
        fs.copyFileSync(githubFileLocalPath, sourceZipFile);

        decompressZip(sourceZipFile, appDataPath);

        fs.rmSync(sourceZipFile, { force: true });

        moveContentsAndRemoveFolder(path.join(appDataPath, listFolders(appDataPath)[0]), appDataPath);

        fs.copyFileSync(githubVersionFileLocalPath, versionFile);
        writeEnvFile(path.join(appDataPath, '.env'), env);
        await writeToFile('just an empty file :)', path.join(appDataPath, 'needRebuild'));
        fs.rmSync(appUpdateBackupPath, { recursive: true, force: true });
    } catch (e) {
        console.error(e);
        // revert changes
        fs.rmSync(appDataPath, { recursive: true, force: true });
        fs.renameSync(appUpdateBackupPath, appDataPath);
    }

    return true;
});

ipcMain.handle('self.removeApp', async function (_: any, project: IProject): Promise<string | boolean> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    let projects: IProject[] = [];
    try {
        projects = await readJson(path.join(dockFusionPath, 'projects.json'));
    } catch (e) {}

    projects = projects.filter((el) => el.domain !== project.domain);
    await saveJson(path.join(dockFusionPath, 'projects.json'), projects);

    fs.rmSync(appDataPath, { recursive: true, force: true });

    return true;
});

ipcMain.handle('self.getProjectsList', async function (_: any): Promise<IProject[]> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);

    let projects: IProject[] = [];
    try {
        projects = await readJson(path.join(dockFusionPath, 'projects.json'));
    } catch (e) {}

    return projects;
});

ipcMain.handle('self.getSettingsByProject', async function (_: any, project: IProject): Promise<any> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    try {
        return await readYaml(path.join(appDataPath, 'settings.yml'));
    } catch (e) {}

    return {};
});

ipcMain.handle('self.getEnvironmentByProject', async function (_: any, project: IProject): Promise<any> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    try {
        return await readEnvFile(path.join(appDataPath, '.env'));
    } catch (e) {}

    return {};
});

ipcMain.handle('self.readProjectFile', async function (_: any, project: IProject, filePath: string) {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    return await readFromFile(path.join(appDataPath, filePath));
});

async function getPortAsync(basePorts: number[]) {
    return new Promise<number[]>((resolve) => {
        getPort(basePorts, function (err: any, ports: number[]) {
            if (err) throw new Error('could not open servers');

            resolve(ports);
        });
    });
}

function getHostRegexp(domain: string) {
    addDNSResolver(domain);
    return `Host(\`${domain}\`)`;
}

function getHostRegexps(domain: string, subdomains: string[] = []) {
    let result = getHostRegexp(domain);
    for (const subdomain of subdomains) {
        result += `||${getHostRegexp(`${subdomain}.${domain}`)}`;
    }
    return result;
}

async function getDockerComposeOverrideSettings(
    domain?: string,
    serviceName?: string | null,
    subdomains: string[] = [],
    httpPort: number = 80,
) {
    let dockerComposeOverride: any = {
        networks: {
            default: {
                driver: 'bridge',
                name: 'dock-fusion-shared-network',
            },
        },
    };
    if (serviceName) {
        const finalDomain = domain ? `${domain}.dock-fusion.run` : 'dock-fusion.run';
        let domains = [finalDomain];
        for (const subdomain of subdomains) {
            domains.push(`${subdomain}.${finalDomain}`);
        }

        for (const domain of domains) {
            //certificate
            const homePath = app.getPath('home');
            let dockFusionPath = path.join(homePath, homeAppDataFolderName);
            let appDataPath = path.join(dockFusionPath, dockerGroupName);
            const certFileName = domain;
            const certificateResult = checkCertificate(path.join(appDataPath, 'certs'), certFileName, domain);
            if (!certificateResult.valid) {
                createAndInstallCertificate(path.join(appDataPath, 'certs'), certFileName, domain);
            }
            let traefikDynamicSettings: any = await readYaml(path.join(appDataPath, 'dynamic.yml'));
            if (
                !traefikDynamicSettings.tls.certificates.find(
                    (cert: any) => cert.certFile === `/certs/${certFileName}.pem`,
                )
            ) {
                traefikDynamicSettings.tls.certificates.push({
                    certFile: `/certs/${certFileName}.pem`,
                    keyFile: `/certs/${certFileName}.key`,
                });
            }
            await saveYaml(path.join(appDataPath, 'dynamic.yml'), traefikDynamicSettings);
        }

        const routersKey = `dock-fusion-${domain ? `${domain}-` : ''}${serviceName}`;
        const hostRule = getHostRegexps(finalDomain, subdomains);
        dockerComposeOverride.services = {
            [serviceName]: {
                labels: [
                    'traefik.enable=true',

                    `traefik.http.services.${routersKey}.loadbalancer.server.port=${httpPort}`,

                    `traefik.http.routers.${routersKey}-http.entrypoints=http`,
                    `traefik.http.routers.${routersKey}-http.rule=${hostRule}`,

                    `traefik.http.routers.${routersKey}-https.entrypoints=https`,
                    `traefik.http.routers.${routersKey}-https.tls=true`,
                    `traefik.http.routers.${routersKey}-https.rule=${hostRule}`,
                ],
            },
        };
    }

    return dockerComposeOverride;
}

async function startRouter() {
    const serviceName = 'traefik';
    const status = await getContainerStatus(`${dockerGroupName}-${serviceName}-1`);
    if (status === 'running') {
        return;
    }
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, dockerGroupName);

    const traefikSettings = {
        global: {
            sendAnonymousUsage: false,
        },
        api: { insecure: true, dashboard: true },
        entryPoints: {
            http: {
                address: ':80',
            },
            https: {
                address: ':443',
            },
        },
        log: {
            level: 'DEBUG',
            format: 'common',
        },
        providers: {
            docker: {
                exposedByDefault: false,
                watch: true,
            },
            file: {
                fileName: '/etc/traefik/dynamic.yml',
                watch: true,
            },
        },
    };
    const traefikDynamicSettings = {
        tls: {
            certificates: [],
        },
    };

    await saveYaml(path.join(appDataPath, 'traefik.yml'), traefikSettings);
    await saveYaml(path.join(appDataPath, 'dynamic.yml'), traefikDynamicSettings);

    const dockerCompose = {
        services: {
            [serviceName]: {
                image: 'traefik:v3.2',
                ports: ['0.0.0.0:80:80', '0.0.0.0:443:443'],
                volumes: [
                    '/var/run/docker.sock:/var/run/docker.sock:ro',
                    './traefik.yml:/etc/traefik/traefik.yml:ro',
                    './dynamic.yml:/etc/traefik/dynamic.yml:ro',
                    './certs:/certs:ro',
                ],
            },
        },
    };
    const dockerComposeOverride = await getDockerComposeOverrideSettings(undefined, serviceName, undefined, 8080);
    await saveYaml(path.join(appDataPath, 'docker-compose.yml'), dockerCompose);
    await saveYaml(path.join(appDataPath, 'docker-compose.override.yml'), dockerComposeOverride);

    exec(`docker compose -p ${dockerGroupName} up -d`, { cwd: appDataPath }, (error, stdout, stderr) => {
        if (error) {
            return;
        }
        if (stderr) {
            return;
        }
    });
}

async function restartRouter() {
    const serviceName = 'traefik';
    const status = await getContainerStatus(`${dockerGroupName}-${serviceName}-1`);
    if (status !== 'running') {
        return;
    }
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, dockerGroupName);

    exec(`docker compose -p ${dockerGroupName} restart`, { cwd: appDataPath }, (error, stdout, stderr) => {
        if (error) {
            return;
        }
        if (stderr) {
            return;
        }
    });
}

ipcMain.handle(
    'self.startProject',
    async function (_: any, project: IProject, forceRebuild: boolean = false): Promise<void> {
        const position = currentStartPosition;
        currentStartPosition++;
        while (processingPosition < position) {
            await sleep(500);
        }
        try {
            await startRouter();

            const homePath = app.getPath('home');
            let dockFusionPath = path.join(homePath, homeAppDataFolderName);
            let appDataPath = path.join(dockFusionPath, 'apps', project.domain);
            let dataPath = path.join(dockFusionPath, 'data', project.domain);

            const settings: any = await readYaml(path.join(appDataPath, 'settings.yml'));
            const dockerCompose: any = await readYaml(path.join(appDataPath, 'docker-compose.yml'));
            const env = (await readEnvFile(path.join(appDataPath, '.env'))) ?? {};

            env.DATA_PATH_HOST = dataPath;

            //setup fresh free ports
            let freePort = 7999;
            if (settings.system.ports.http) {
                freePort = (await getPortAsync([++freePort]))[0];
                env[settings.system.ports.http] = freePort.toString();
            }
            for (const target of settings.system.ports.others ?? []) {
                freePort = (await getPortAsync([++freePort]))[0];
                env[target] = freePort.toString();
            }

            await writeEnvFile(path.join(appDataPath, '.env'), env);

            let httpPort: number | undefined = undefined;
            let httpServiceName: string | undefined = undefined;
            if (settings.system.ports.http) {
                for (const serviceName of Object.keys(dockerCompose.services)) {
                    const service = dockerCompose.services[serviceName];

                    let httpPortFound = false;
                    for (let i = 0; i < (service.ports ?? []).length; ++i) {
                        if (service.ports[i].includes(settings.system.ports.http)) {
                            httpPortFound = true;
                            httpServiceName = serviceName;
                            const ports = service.ports[i].split(':');
                            httpPort = Number(ports[ports.length - 1]);
                            break;
                        }
                    }
                    if (httpPortFound) {
                        break;
                    }
                }
            }

            const dockerComposeOverride = await getDockerComposeOverrideSettings(
                project.domain,
                httpServiceName,
                [],
                httpPort,
            );
            await saveYaml(path.join(appDataPath, 'docker-compose.override.yml'), dockerComposeOverride);

            await restartRouter();

            const needRebuild = await doesExist(path.join(appDataPath, 'needRebuild'));
            if (needRebuild) {
                fs.rmSync(path.join(appDataPath, 'needRebuild'));
            }

            processingPosition++;
            return new Promise((resolve, reject) => {
                exec(
                    `docker compose -p ${dockerGroupName}-${project.domain} up ${forceRebuild || needRebuild ? ' --build' : ''} -d`,
                    { cwd: appDataPath },
                    (error, stdout, stderr) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        if (stderr) {
                            console.error(stderr);
                            resolve();
                            return;
                        }
                        resolve();
                    },
                );
            });
        } catch (e) {
            processingPosition++;
            throw e;
        }
    },
);

ipcMain.handle('self.stopProject', async function (_: any, project: IProject): Promise<void> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    return new Promise((resolve, reject) => {
        exec(
            `docker compose -p ${dockerGroupName}-${project.domain} down`,
            { cwd: appDataPath },
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    resolve();
                    return;
                }
                resolve();
            },
        );
    });
});

ipcMain.handle(
    'self.execCommandInProject',
    async function (_: any, containerId: string, command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(`docker exec -i ${containerId} ${command}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(stderr);
                    resolve();
                    return;
                }
                resolve();
            });
        });
    },
);

ipcMain.handle(
    'self.doesExistAtProject',
    async function (_: any, project: IProject, targetPath: string): Promise<boolean> {
        const homePath = app.getPath('home');
        let dockFusionPath = path.join(homePath, homeAppDataFolderName);
        let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

        const env = (await readEnvFile(path.join(appDataPath, '.env'))) ?? {};

        if (!env.APP_CODE_PATH_HOST) {
            return false;
        }

        return doesExist(path.join(env.APP_CODE_PATH_HOST, targetPath));
    },
);

ipcMain.handle('self.doesExist', async function (_: any, targetPath: string): Promise<boolean> {
    return doesExist(targetPath);
});

ipcMain.handle('self.spawnLogsAtProject', async (_: any, project: IProject) => {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    await runCommandInTerminal(`docker compose -p ${dockerGroupName}-${project.domain} logs -f -n 20`, appDataPath);
});

ipcMain.handle('self.spawnTerminalAtProject', async (_: any, project: IProject, command: string) => {
    const projectKey = 'com.docker.compose.project';
    const projectName = `${dockerGroupName}-${project.domain}`;
    const containers = (await docker.listContainers()).filter((el) => el.Labels[projectKey] === projectName);

    if (!containers.length) {
        throw new Error('No container available');
    }

    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);
    const containerId = containers[0].Id;

    await runCommandInTerminal(`docker exec -it ${containerId} ${command}`, appDataPath);
});

ipcMain.handle('self.spawnTerminal', async (_: any, command: string) => {
    await runCommandInTerminal(command);
});

function runCommandInTerminal(command: string, folderPath?: string) {
    // Spawn a terminal with the given command
    spawn(command, {
        shell: true,
        detached: true,
        cwd: folderPath,
        stdio: 'ignore',
    }).unref();
}

ipcMain.handle('self.openFolder', async function (_: any, targetPath: string): Promise<void> {
    exec(`explorer.exe "${targetPath}"`);
});

ipcMain.handle('self.openProjectAppDataFolder', async function (_: any, project: IProject): Promise<void> {
    const homePath = app.getPath('home');
    let dockFusionPath = path.join(homePath, homeAppDataFolderName);
    let appDataPath = path.join(dockFusionPath, 'apps', project.domain);

    exec(`explorer.exe "${appDataPath}"`);
});
