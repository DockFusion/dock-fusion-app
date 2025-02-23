import { exec } from 'child_process';
import * as os from 'os';
import {
    installChocolatey,
    installMkcert,
    isCommandAvailable,
    isMkcertConfigured,
    setupMkcert,
} from 'src/electron/utils';
import { getBuildNumber as getBuildNumberUtils, isAppInstalled, openApp } from './utils';

export async function release() {
    return os.release();
}

export async function getBuildNumber() {
    return getBuildNumberUtils();
}

export async function isDockerDesktopInstalled() {
    return isAppInstalled('Docker');
}

export async function openDockerDesktop() {
    return openApp('Docker', 'Docker Desktop.exe');
}

export async function downloadFile(_: any, url: string, downloadPath?: string, outputFileName?: string) {
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
}

export async function deletePath(_: any, deletePath: string) {
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
}

export async function installDependencies(_: any): Promise<void> {
    await installChocolatey();
    await installMkcert();
    await setupMkcert();
}

export async function checkDependencies(_: any): Promise<boolean> {
    const isChocoInstalled = isCommandAvailable('choco');

    const isMkcertInstalled = isCommandAvailable('mkcert');

    let isMkcertReady = false;
    if (isMkcertInstalled) {
        isMkcertReady = isMkcertConfigured();
    }

    const allReady = isChocoInstalled && isMkcertInstalled && isMkcertReady;

    return allReady;
}
