export const Shell = {
    openExternal: async (url: string, options?: Electron.OpenExternalOptions) => {
        return await window.electron.shell.openExternal(url, options);
    },
};
