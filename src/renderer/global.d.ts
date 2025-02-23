// global.d.ts
import * as Dockerode from 'dockerode';
import { OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import { IEditor, IShell } from 'src/shared/interfaces';
import { IInstallAppSettings, IMarketplaceItem, IProject } from '../shared/interfaces';
export {};

declare global {
    interface WSLStatus {
        defaultDistribution: string | null;
        defaultVersion: string | null;
    }

    interface WSLDistribution {
        name: string;
        state: string;
        version: string;
    }

    interface GithubVersion {
        name: string;
        zipball_url: string;
        tarball_url: string;
        node_id: string;
        commit: {
            sha: string;
            url: string;
        };
    }

    interface IProjectWithMarketPlace extends IProject {
        marketplaceItem: IMarketplaceItem;
        name: string;
    }

    interface Window {
        electron: {
            childProcess: {
                execSync: (command: any) => Promise<Buffer>;
                exec: (command: any, callback: any) => Promise<ChildProcess>;
            };
            docker: {
                info: () => Promise<any | null>;
                version: () => Promise<Dockerode.DockerVersion | null>;
                listContainers: () => Promise<Dockerode.ContainerInfo[]>;
                inpectContainer: (containerId: string) => Promise<Dockerode.ContainerInspectInfo | null>;
            };
            windows: {
                isDockerDesktopInstalled: () => Promise<boolean>;
                openDockerDesktop: () => Promise<boolean>;
                release: () => Promise<string>;
                getBuildNumber: () => Promise<number>;
                downloadFile: (url: string, downloadPath?: string, outputFileName?: string) => Promise<boolean>;
                delete: (deletePath: string) => Promise<boolean>;
                installDependencies: () => Promise<void>;
                checkDependencies: () => Promise<boolean>;
            };
            wsl: {
                getStatus: () => Promise<WSLStatus>;
                getDistributions: () => Promise<WSLDistribution[]>;
                install: () => Promise<boolean>;
                setDefault: (distribution: string) => Promise<boolean>;
                import: (
                    distributionName: string,
                    distributionPath: string,
                    fileToImportPath: string,
                ) => Promise<boolean>;
            };
            shell: {
                openExternal: (url: string, options?: Electron.OpenExternalOptions) => Promise<void>;
            };
            detectEditors: {
                getAvailableEditors: () => Promise<IEditor[]>;
            };
            detectShells: {
                getAvailableShells: () => Promise<IShell[]>;
            };
            self: {
                restart: () => Promise<void>;
                getPath: (
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
                ) => Promise<string>;
                getVersion: () => Promise<string>;
                showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
                installApp: (
                    options: IInstallAppSettings[],
                    marketplaceItem: IMarketplaceItem,
                ) => Promise<string | boolean>;
                editApp: (options: IInstallAppSettings[], project: IProject) => Promise<string | boolean>;
                getProjectsList: () => Promise<IProject[]>;
                getSettingsByProject: (project: IProject) => Promise<any>;
                getEnvironmentByProject: (project: IProject) => Promise<any>;
                readProjectFile: (project: IProject, filePath: string) => Promise<any>;
                startProject: (project: IProject, forceRebuild?: boolean) => Promise<void>;
                stopProject: (project: IProject) => Promise<void>;
                doesExist: (targetPath: string) => Promise<boolean>;
                doesExistAtProjectCodePath: (project: IProject, targetPath: string) => Promise<boolean>;
                doesExistAtProject: (project: IProject, targetPath: string) => Promise<boolean>;
                execCommandInProject: (containerId: string, command: string) => Promise<void>;
                renameApp: (appName: string, project: IProject) => Promise<string | boolean>;
                updateApp: (project: IProject) => Promise<void>;
                removeApp: (project: IProject) => Promise<void>;
                spawnTerminal: (command: string) => Promise<void>;
                spawnTerminalAtProject: (project: IProject, command: string) => Promise<void>;
                spawnLogsAtProject: (project: IProject) => Promise<void>;
                openFolder: (targetPath: string) => Promise<void>;
                openProjectAppDataFolder: (project: IProject) => Promise<void>;
            };
            github: {
                downloadMarketplaceFile: (downloadUrl: string, github: string, filePath: string) => Promise<string>;
                readMarketplaceFile: (github: string, filePath: string) => Promise<string>;
            };
            api: {
                send: (channel: string, data: any) => void;
                on: (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
                off: (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
            };
        };
    }
}
