import { ProjectStatus } from 'src/enums';
import { IMarketplaceItem } from 'src/shared/interfaces';
import { Shell } from './shell';

export function openExternal(url: string, options?: Electron.OpenExternalOptions) {
    Shell.openExternal(url, options);
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getMarketplaceItems(): IMarketplaceItem[] {
    return require('src/assets/marketplace/stacks.json');
}

export function getNewContainerStatus(status?: string) {
    switch (status) {
        case 'created':
            return ProjectStatus.starting;

        case 'running':
            return ProjectStatus.running;

        case 'restarting':
            return ProjectStatus.stopping;

        case 'paused':
            return ProjectStatus.paused;

        case 'exited':
            return ProjectStatus.error;

        case 'destroy':
            return ProjectStatus.stopped;

        default:
            return ProjectStatus.unknown;
    }
}
