import { exec } from 'child_process';
import { app, ipcMain, net } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { readFromFile, sleep } from '../utils';

let marketplaceDownloads: any = {};

async function pathExist(path: string) {
    return new Promise<boolean>((resolve, reject) => {
        exec(`if exist "${path}" echo 1`, { shell: 'cmd.exe', encoding: 'utf8' }, (err, stdout, stderr) => {
            if (err) {
                resolve(false);
            }
            if (stderr) {
                resolve(false);
            }

            resolve(stdout.match('1') != null);
        });
    });
}

async function deleteFolder(path: string) {
    return new Promise<boolean>((resolve, reject) => {
        exec(`rmdir /s /q "${path}"`, { shell: 'cmd.exe', encoding: 'utf8' }, (err, stdout, stderr) => {
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

async function createFolder(path: string) {
    return new Promise<boolean>((resolve, reject) => {
        exec(`mkdir "${path}"`, { shell: 'cmd.exe', encoding: 'utf8' }, (err, stdout, stderr) => {
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

async function writeToFile(text: string, path: string) {
    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(path, text, 'utf8', (err) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}

async function downloadFile(url: string, downloadPath?: string, outputFileName?: string) {
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

    const response = await net.fetch(url);

    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = outputFileName ?? 'downloaded_file';

    if (outputFileName == null && contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
    }

    const filePath = path.join(downloadPath ?? app.getPath('downloads'), filename);

    if (response.status !== 200) {
        writeToFile('', filePath);
        return false;
    }

    const fileStream = fs.createWriteStream(filePath);

    const reader = response.body!.getReader();

    // Read the stream in chunks and write to the file
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(Buffer.from(value)); // Convert Uint8Array to Buffer for writing
    }

    fileStream.end();

    // exec(
    //     `${commandPrefix} curl -s ${url} ${commandArguments}`,
    //     { shell: 'cmd.exe', encoding: 'utf16le' },
    //     (err, stdout, stderr) => {
    //         if (err) {
    //             resolve(false);
    //         }
    //         if (stderr) {
    //             resolve(false);
    //         }

    //         resolve(true);
    //     },
    // );
    return true;
}

ipcMain.handle(
    'github.downloadMarketplaceFile',
    async function (_: any, downloadUrl: string, github: string, filePath: string) {
        const githubSplited = github.split('/');
        const version = githubSplited[githubSplited.length - 1];
        const githubWithoutVersion = github.substring(0, github.length - version.length - 1);

        const githubProjectLocalPath = `${app.getPath('userData')}/githubDownloads/${githubWithoutVersion}`;
        const githubFileLocalPath = `${githubProjectLocalPath}/${filePath}`;

        if (marketplaceDownloads[githubFileLocalPath]) {
            while (marketplaceDownloads[githubFileLocalPath]) {
                await sleep(500);
            }
        }
        marketplaceDownloads[githubFileLocalPath] = true;
        let needFullUpdate = false;
        if (await pathExist(`${githubProjectLocalPath}/version`)) {
            const localVersion = await readFromFile(`${githubProjectLocalPath}/version`);
            if (localVersion !== version) {
                needFullUpdate = true;
            }
        } else {
            needFullUpdate = true;
        }
        if (needFullUpdate) {
            await deleteFolder(githubProjectLocalPath);
            await createFolder(githubProjectLocalPath);
            await writeToFile(version, `${githubProjectLocalPath}/version`);
        }

        if (!(await pathExist(githubFileLocalPath))) {
            await downloadFile(downloadUrl, githubProjectLocalPath, filePath);
        }
        marketplaceDownloads[githubFileLocalPath] = false;

        return githubFileLocalPath.replaceAll('\\', '/');
    },
);

ipcMain.handle('github.readMarketplaceFile', async function (_: any, github: string, filePath: string) {
    const githubSplited = github.split('/');
    const version = githubSplited[githubSplited.length - 1];
    const githubWithoutVersion = github.substring(0, github.length - version.length - 1);

    const githubProjectLocalPath = `${app.getPath('userData')}/githubDownloads/${githubWithoutVersion}`;
    const githubFileLocalPath = `${githubProjectLocalPath}/${filePath}`;

    if (marketplaceDownloads[githubFileLocalPath]) {
        while (marketplaceDownloads[githubFileLocalPath]) {
            await sleep(500);
        }
    }

    return await readFromFile(githubFileLocalPath);
});
