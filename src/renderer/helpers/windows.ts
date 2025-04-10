export const Windows = {
    release: async () => {
        return await window.electron?.windows.release();
    },
    getBuildNumber: async () => {
        return await window.electron?.windows.getBuildNumber();
    },
    downloadFile: async (url: string, downloadPath?: string, outputFileName?: string) => {
        return await window.electron?.windows.downloadFile(url, downloadPath, outputFileName);
    },
    delete: async (deletePath: string) => {
        return await window.electron?.windows.delete(deletePath);
    },
    installDependencies: async () => {
        return await window.electron?.windows.installDependencies();
    },
    checkDependencies: async () => {
        return await window.electron?.windows.checkDependencies();
    },
};
