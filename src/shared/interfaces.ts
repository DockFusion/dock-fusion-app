import { Editor, Shell } from './enums';

export interface IMarketplaceItem {
    id: string;
    name: string;
    logo: string;
    description: string;
    tags: string[];
    website: string;
    github: string;
    version: string;
}

export interface IInstallAppSettings {
    title: string;
    description: string;
    type: string;
    target: string;
    values: string[];
    value: any;
}

export interface IProject {
    label?: string;
    domain: string;
    appId: string;
    github: string;
}

export interface IEditor {
    editor: Editor;
    name: string;
    cmd: string;
}

export interface IShell {
    shell: Shell;
    name: string;
    cmd: string;
}
