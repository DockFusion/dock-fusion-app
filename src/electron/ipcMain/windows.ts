import { exec } from 'child_process';
import { ipcMain } from 'electron';
import * as os from 'os';
import {
    installChocolatey,
    installMkcert,
    isCommandAvailable,
    isMkcertConfigured,
    setupMkcert,
} from 'src/electron/utils';

async function getAppInstallationLocation(appName: string) {
    return new Promise<string>((resolve, reject) => {
        exec(
            `reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall" /s /f "${appName}"`,
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                if (stderr) {
                    reject(stderr);
                }

                const lines = stdout.split('\n');
                const installLocationLine = lines.find((line) => line.includes('InstallLocation'));
                if (installLocationLine) {
                    const path = installLocationLine.split(/\s{2,}/).pop();
                    if (path) {
                        resolve(path);
                    } else {
                        reject(`Couldn't find the installation location of ${appName}`);
                    }
                } else {
                    reject(`Couldn't find the installation location of ${appName}`);
                }
            },
        );
    });
}

async function isAppInstalled(appName: string) {
    const path = await getAppInstallationLocation('Docker');
    return path ? true : false;
}

async function openApp(appName: string, exePathInInstallationLocation: string) {
    const path = await getAppInstallationLocation(appName);
    const exePath = `${path}${exePathInInstallationLocation.startsWith('\\') ? '' : '\\'}${exePathInInstallationLocation}`;

    return new Promise<string>((resolve, reject) => {
        exec(`"${exePath}"`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
}

function getBuildNumber() {
    const splitedVersion = os.release().split('.');
    return parseInt(splitedVersion[splitedVersion.length - 1]);
}

ipcMain.handle('windows.release', async function () {
    return os.release();
});

ipcMain.handle('windows.getBuildNumber', async function () {
    return getBuildNumber();
});

ipcMain.handle('windows.isDockerDesktopInstalled', async function () {
    return isAppInstalled('Docker');
});

ipcMain.handle('windows.openDockerDesktop', async function () {
    return openApp('Docker', 'Docker Desktop.exe');
});

ipcMain.handle(
    'windows.downloadFile',
    async function (_: any, url: string, downloadPath?: string, outputFileName?: string) {
        let commandArguments = '';
        let commandPrefix = '';

        if (downloadPath && outputFileName) {
            commandPrefix = `cd ${downloadPath} &&`;
            commandArguments = `--output ${outputFileName}`;
        } else if (downloadPath) {
            commandPrefix = `cd ${downloadPath} &&`;
            commandArguments = `--remote-name`;
        } else {
            commandArguments = `--output ${outputFileName}`;
        }

        return new Promise<boolean>((resolve, reject) => {
            exec(
                `${commandPrefix} curl ${url} ${commandArguments}`,
                { shell: 'cmd.exe', encoding: 'utf16le' },
                (err, stdout, stderr) => {
                    if (err) {
                        resolve(false);
                    }
                    if (stderr) {
                        resolve(false);
                    }

                    resolve(true);
                },
            );
        });
    },
);

ipcMain.handle('windows.delete', async function (_: any, deletePath: string) {
    return new Promise<boolean>((resolve, reject) => {
        exec(`del ${deletePath}`, { shell: 'cmd.exe', encoding: 'utf16le' }, (err, stdout, stderr) => {
            if (err) {
                resolve(false);
            }
            if (stderr) {
                resolve(false);
            }

            resolve(true);
        });
    });
});

ipcMain.handle('windows.installDependencies', async function (_: any): Promise<void> {
    installChocolatey();
    installMkcert();
    setupMkcert();
});

ipcMain.handle('windows.checkDependencies', async function (_: any): Promise<boolean> {
    const isChocoInstalled = isCommandAvailable('choco');

    const isMkcertInstalled = isCommandAvailable('mkcert');

    let isMkcertReady = false;
    if (isMkcertInstalled) {
        isMkcertReady = isMkcertConfigured();
    }

    const allReady = isChocoInstalled && isMkcertInstalled && isMkcertReady;

    return allReady;
});
