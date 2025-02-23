import { exec, spawn } from 'child_process';
import { app } from 'electron';
import path from 'path';
import {
    addDNSResolver,
    checkCertificate,
    createAndInstallCertificate,
    getContainerStatus,
    readYaml,
    saveYaml,
} from 'src/electron/utils';
import { dockerGroupName, homeAppDataFolderName } from 'src/shared/constants';
const getPort = require('get-ports');

export async function getPortAsync(basePorts: number[]) {
    return new Promise<number[]>((resolve) => {
        getPort(basePorts, function (err: any, ports: number[]) {
            if (err) throw new Error('could not open servers');

            resolve(ports);
        });
    });
}

export function getHostRegexp(domain: string) {
    addDNSResolver(domain);
    return `Host(\`${domain}\`)`;
}

export function getHostRegexps(domain: string, subdomains: string[] = []) {
    let result = getHostRegexp(domain);
    for (const subdomain of subdomains) {
        result += `||${getHostRegexp(`${subdomain}.${domain}`)}`;
    }
    return result;
}

export async function getDockerComposeOverrideSettings(
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

export async function startRouter() {
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

export async function restartRouter() {
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

export function runCommandInTerminal(command: string, folderPath?: string) {
    // Spawn a terminal with the given command
    spawn(command, {
        shell: true,
        detached: true,
        cwd: folderPath,
        stdio: 'ignore',
    }).unref();
}
