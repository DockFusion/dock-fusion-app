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
