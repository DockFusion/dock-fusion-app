import { shell } from 'electron';

export async function openExternal(_: any, url: string, options?: Electron.OpenExternalOptions) {
    shell.openExternal(url, options);
}
