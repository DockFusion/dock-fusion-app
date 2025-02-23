import { exec } from 'child_process';
import * as os from 'os';

export async function getAppInstallationLocation(appName: string) {
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

export async function isAppInstalled(appName: string) {
    const path = await getAppInstallationLocation('Docker');
    return path ? true : false;
}

export async function openApp(appName: string, exePathInInstallationLocation: string) {
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

export function getBuildNumber() {
    const splitedVersion = os.release().split('.');
    return parseInt(splitedVersion[splitedVersion.length - 1]);
}
