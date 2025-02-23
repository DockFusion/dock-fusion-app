import * as x509 from '@peculiar/x509';
import { SubjectAlternativeNameExtension } from '@peculiar/x509';
import { exec, execSync } from 'child_process';
import Dockerode from 'dockerode';
import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import sudo from 'sudo-prompt';
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const AdmZip = require('adm-zip');
const envFile = require('envfile');

const docker = new Dockerode({});

export function isAix() {
    return process.platform === 'aix';
}

export function isDarwin() {
    return process.platform === 'darwin';
}

export function isFreebsd() {
    return process.platform === 'freebsd';
}

export function isLinux() {
    return process.platform === 'linux';
}

export function isOpenbsd() {
    return process.platform === 'openbsd';
}

export function isSunos() {
    return process.platform === 'sunos';
}

export function isWin32() {
    return process.platform === 'win32';
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function saveJson(filePath: string, data: any) {
    return new Promise<boolean>((resolve, reject) => {
        // Convert data to a JSON string with 2 spaces for indentation
        const jsonData = JSON.stringify(data, null, 2);
        const dir = path.dirname(filePath);

        // Ensure the directory exists, creating it if necessary
        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                reject(err);
                return;
            }

            // Now write the file
            fs.writeFile(filePath, jsonData, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    });
}

export function readJson(filePath: string) {
    return new Promise<any>((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, jsonData) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const data = JSON.parse(jsonData);
                resolve(data);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
}

export function saveYaml(filePath: string, data: any) {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const yamlData = yaml.dump(data);
            const dir = path.dirname(filePath);

            // Ensure the directory exists, creating it if necessary
            fs.mkdir(dir, { recursive: true }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                fs.writeFile(filePath, yamlData, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch (err) {
            console.error('An error occurred while converting data to YAML:', err);
            reject(err);
        }
    });
}

export function readYaml(filePath: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, yamlData) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                const data = yaml.load(yamlData);
                resolve(data);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
}

export function decompressZip(zipFilePath: string, outputDir: string) {
    try {
        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Load the ZIP file
        const zip = new AdmZip(zipFilePath);

        // Extract to the output directory
        zip.extractAllTo(outputDir, true);
    } catch (error) {}
}

export function listFolders(directoryPath: string) {
    try {
        // Read all items in the directory
        const items = fs.readdirSync(directoryPath);

        // Filter out only directories
        const folders = items.filter((item) => {
            const fullPath = path.join(directoryPath, item);
            return fs.statSync(fullPath).isDirectory();
        });

        return folders;
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
}

export function moveContentsAndRemoveFolder(sourceDir: string, targetDir: string) {
    try {
        // Ensure target directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Read all items in the source directory
        const items = fs.readdirSync(sourceDir);

        // Move each item to the target directory
        items.forEach((item) => {
            const sourcePath = path.join(sourceDir, item);
            const targetPath = path.join(targetDir, item);

            // Rename handles moving the file/directory
            fs.renameSync(sourcePath, targetPath);
        });

        // Remove the source directory
        fs.rmdirSync(sourceDir);
    } catch (error) {}
}

export function readEnvFile(filePath: string): Record<string, string> | null {
    try {
        // Read the .env file as a string
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Parse the content into an object
        const parsedEnv = envFile.parse(fileContent);

        return parsedEnv;
    } catch (error) {
        return null;
    }
}

export function writeEnvFile(filePath: string, data: Record<string, string>): void {
    try {
        // Convert object to .env format string
        const envString = envFile.stringify(data);

        // Write to the .env file
        fs.writeFileSync(filePath, envString, 'utf8');
    } catch (error) {}
}

export function executeScriptAsAdmin(scriptCommand: string) {
    const options = {
        name: 'Electron App',
    };

    sudo.exec(scriptCommand, options, (error, stdout, stderr) => {
        if (error) {
            return;
        }
        if (stderr) {
        }
    });
}

export function addDNSResolver(domain: string, ip = '127.0.0.1') {
    const hostsFilePath = path.join('C:', 'Windows', 'System32', 'drivers', 'etc', 'hosts');
    const entry = `${ip} ${domain}`;

    // Read the current contents of the hosts file
    const hostsFileContent = fs.readFileSync(hostsFilePath, 'utf8');

    // Check if the entry already exists
    const entryExists = hostsFileContent.split('\n').some((line) => !line.startsWith('#') && line.includes(domain));

    if (entryExists) {
        return;
    }

    const scriptCommand = `powershell -Command "Add-Content -Path '${hostsFilePath}' -Value '${entry}'"`;

    executeScriptAsAdmin(scriptCommand);
}

export function removeDNSResolver(domain: string) {
    // Generate a script to modify the hosts file
    const tempScriptPath = path.join(__dirname, 'tempRemoveDNS.js');
    const scriptContent = `
            const fs = require('fs');
            const path = require('path');
            const domain = '${domain}';
            const hostsFilePath = path.join('C:', 'Windows', 'System32', 'drivers', 'etc', 'hosts');
    
            try {
                const hostsFileContent = fs.readFileSync(hostsFilePath, 'utf8');
                const updatedContent = hostsFileContent
                    .split('\\n')
                    .filter((line) => !line.includes(domain))
                    .join('\\n');
                fs.writeFileSync(hostsFilePath, updatedContent);
            } catch (err) {
            }
        `;

    // Write the temporary script to disk
    fs.writeFileSync(tempScriptPath, scriptContent, 'utf8');

    // Execute the script with elevated privileges
    exec(`runas /user:Administrator node "${tempScriptPath}"`, (err: any, stdout: any, stderr: any) => {
        // Clean up the temporary script
        fs.unlinkSync(tempScriptPath);

        if (err) {
            return;
        }
    });
}

// Function to run a command with sudo-prompt if not elevated
const runAsAdmin = (command: string) => {
    return new Promise<void>((resolve, reject) => {
        const options = {
            name: 'InstallScript',
        };

        sudo.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                console.error(stderr);
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

// Function to execute shell commands
export const runCommand = (command: string) => {
    try {
        const output = execSync(command, { stdio: 'inherit' });
        return output;
    } catch (error) {
        process.exit(1);
    }
};

// Step 1: Install Chocolatey
export const installChocolatey = async () => {
    const isChocoInstalled = isCommandAvailable('choco');
    if (isChocoInstalled) {
        return;
    }
    const chocoInstallScript = `
      @powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    `;
    await runAsAdmin(chocoInstallScript);
};

// Step 2: Install mkcert using Chocolatey
export const installMkcert = async () => {
    const isMkcertInstalled = isCommandAvailable('mkcert');
    if (isMkcertInstalled) {
        return;
    }
    await runAsAdmin('choco install mkcert -y');
};

// Step 3: Run mkcert -install
export const setupMkcert = async () => {
    const isMkcertInstalled = isCommandAvailable('mkcert');
    if (!isMkcertInstalled) {
        await installMkcert();
    }
    const isMkcertReady = isMkcertConfigured();
    if (isMkcertReady) {
        return;
    }
    runCommand('mkcert -install');
};

// Function to check if a command exists
export const isCommandAvailable = (command: string): boolean => {
    try {
        execSync(`where ${command}`, { stdio: 'ignore' }); // `where` checks for command availability on Windows
        return true;
    } catch {
        return false;
    }
};

// Function to check if mkcert CA is installed
export const isMkcertConfigured = (): boolean => {
    try {
        const output = execSync('mkcert -CAROOT', { encoding: 'utf-8' });
        return true;
    } catch {
        return false;
    }
};

export function arrayBufferToString(buffer: ArrayBuffer): string {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
}

export const checkCertificate = (certDir: string, certFileName: string, domain: string): CertificateStatus => {
    try {
        const certPath = path.join(certDir, `${certFileName}.pem`);

        // Read the certificate file
        const certBuffer = fs.readFileSync(certPath);

        // Create a Certificate object using @peculiar/x509
        const cert = new x509.X509Certificate(certBuffer);

        // Check validity dates
        const now = new Date();
        const validFrom = cert.notBefore;
        const validTo = cert.notAfter;

        if (now < validFrom) {
            return { valid: false, reason: `Certificate not yet valid (valid from: ${cert.notBefore})` };
        }
        if (now > validTo) {
            return { valid: false, reason: `Certificate expired (valid to: ${cert.notAfter})` };
        }

        // Check if the certificate matches the domain (subject CN or SAN)
        const commonNameS = cert.subjectName.getField('CN');
        const subjectAltNames = cert.extensions
            .filter((extension) => extension instanceof SubjectAlternativeNameExtension)
            .map((subjectAltName) => arrayBufferToString(subjectAltName.value));
        const domainMatch =
            commonNameS.some((commonName: string) => commonName.includes(domain)) ||
            subjectAltNames.some((altName: string) => altName.includes(domain));

        if (!domainMatch) {
            return { valid: false, reason: `Certificate common name does not match domain: ${domain}` };
        }

        return { valid: true, certificateDetails: cert };
    } catch (error: any) {
        return { valid: false, reason: `Error reading or parsing certificate: ${error.message}` };
    }
};

export const createAndInstallCertificate = (certDir: string, certFileName: string, domain: string): string => {
    try {
        // Ensure mkcert is installed and configured
        execSync('mkcert -version', { stdio: 'ignore' });

        // Ensure the directory exists, if not create it
        if (!fs.existsSync(certDir)) {
            fs.mkdirSync(certDir, { recursive: true });
        }

        // Define the full certificate file paths
        const certPath = path.join(certDir, certFileName);

        // Generate the certificate files
        execSync(`mkcert -cert-file ${certPath}.pem -key-file ${certPath}.key ${domain}`, { stdio: 'inherit' });

        // Verify the certificate files exist
        if (!fs.existsSync(`${certPath}.pem`) || !fs.existsSync(`${certPath}.key`)) {
            return `Certificate creation failed. Files not found at ${certPath}.pem and ${certPath}.key.`;
        }

        // Optionally install the certificate (this step depends on your platform)
        execSync('mkcert -install', { stdio: 'inherit' });

        return `Certificate created and installed for ${domain}. Files saved at ${certPath}.pem and ${certPath}.key.`;
    } catch (error: any) {
        return `Failed to create or install certificate for ${domain}.`;
    }
};

export async function getContainerStatus(containerNameOrId: string): Promise<string | null> {
    try {
        // Get the container object
        const container = docker.getContainer(containerNameOrId);

        // Inspect the container to get its details
        const containerInfo = await container.inspect();

        // Extract and log the container status
        const status = containerInfo.State.Status; // Possible values: "running", "exited", "paused", etc.
        return status;
    } catch (error: any) {
        return null;
    }
}

export async function trackContainerStatus(): Promise<void> {
    try {
        // Create a stream for Docker events
        const eventStream = await docker.getEvents();

        // Listen for events
        eventStream.on('data', (data) => {
            // Parse the event data
            const event = JSON.parse(data.toString());

            // Check if the event type is related to containers
            if (event.Type === 'container') {
                const containerEvent = {
                    id: event.Actor.ID,
                    name: event.Actor.Attributes.name,
                    attributes: event.Actor.Attributes,
                    action: event.Action,
                    status: event.status,
                    timestamp: new Date(event.time * 1000).toISOString(), // Convert UNIX timestamp
                };

                for (const window of BrowserWindow.getAllWindows()) {
                    window.webContents.send('docker-container-event', containerEvent);
                }
            }
        });

        // Handle stream errors
        eventStream.on('error', (error) => {
            console.error('Error listening to Docker events:', error);
            setTimeout(trackContainerStatus, 500);
        });
    } catch (error: any) {
        // console.error('Error listening to Docker events:', error);
        setTimeout(trackContainerStatus, 500);
    }
}

export async function readFromFile(path: string) {
    return new Promise<string | boolean>((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(data);
        });
    });
}

export async function doesExist(targetPath: string): Promise<boolean> {
    const resolvedPath = path.resolve(targetPath); // Resolves the absolute path

    const result = new Promise<boolean>((resolve, reject) => {
        // Checks if the file/directory is accessible
        fs.access(resolvedPath, fs.constants.F_OK, (error) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
    return await result;
}

export async function writeToFile(text: string, path: string) {
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
