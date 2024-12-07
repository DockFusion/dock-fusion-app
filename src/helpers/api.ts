export const Api = {
    send: async (channel: string, data: any) => {
        return await window.electron.api.send(channel, data);
    },
    on: async (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        return await window.electron.api.on(channel, func);
    },
    off: async (channel: string, func: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => {
        return await window.electron.api.off(channel, func);
    },
};
