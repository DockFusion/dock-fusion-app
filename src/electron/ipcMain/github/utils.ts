import { exec } from 'child_process';
import { app, net } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { writeToFile } from 'src/electron/utils';

export async function pathExist(path: string) {
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

export async function deleteFolder(path: string) {
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

export async function createFolder(path: string) {
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

export async function downloadFile(url: string, downloadPath?: string, outputFileName?: string) {
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
