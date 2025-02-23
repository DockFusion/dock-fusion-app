import { exec } from 'child_process';

export async function getStatus() {
    return new Promise<WSLStatus>((resolve, reject) => {
        exec('wsl --status', { shell: 'cmd.exe', encoding: 'utf16le' }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            if (stderr) {
                reject(stderr);
            }

            const defaultDistributionMatch = stdout.match(/Default Distribution:\s*(.+)/);
            const defaultVersionMatch = stdout.match(/Default Version:\s*(.+)/);

            resolve({
                defaultDistribution: defaultDistributionMatch ? defaultDistributionMatch[1].trim() : null,
                defaultVersion: defaultVersionMatch ? defaultVersionMatch[1].trim() : null,
            });
        });
    });
}

export async function getDistributions() {
    return new Promise<WSLDistribution[]>((resolve, reject) => {
        exec('wsl -l -v', { shell: 'cmd.exe', encoding: 'utf16le' }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            }
            if (stderr) {
                reject(stderr);
            }

            const lines = stdout
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line);

            const distributions = lines.slice(1).map((line) => {
                // Use regex to capture the name, state, and version
                const match = line.match(/^\*\s*(.+?)\s+(\w+)\s+(\d+)$/) || line.match(/^(\S+)\s+(\w+)\s+(\d+)$/);

                if (match) {
                    const name = match[1].replace(/^\*/, '').trim(); // Clean asterisk from name
                    const state = match[2]; // State
                    const version = match[3]; // Version

                    return {
                        name: name,
                        state: state,
                        version: version,
                    };
                }

                return null; // In case of no match, return null
            });

            resolve(distributions as WSLDistribution[]);
        });
    });
}

export async function install() {
    return new Promise<boolean>((resolve, reject) => {
        exec('wsl --install  --no-distribution', { shell: 'cmd.exe', encoding: 'utf16le' }, (err, stdout, stderr) => {
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

export async function setDefault(_: any, distributionName: string) {
    return new Promise<boolean>((resolve, reject) => {
        exec(
            `wsl --set-default ${distributionName}`,
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

export async function importDistribution(
    _: any,
    distributionName: string,
    distributionPath: string,
    fileToImportPath: string,
) {
    return new Promise<boolean>((resolve, reject) => {
        exec(
            `wsl --import ${distributionName} ${distributionPath} ${fileToImportPath}`,
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
