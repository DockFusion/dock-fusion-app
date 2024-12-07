import { wslInstallationDocs, wslInstallationDocsAfter19041 } from 'src/shared/constants';
import { openExternal } from './helpers';
import { Windows } from './windows';

export const WSL = {
    getStatus: async () => {
        return await window.electron.wsl.getStatus();
    },
    getDistributions: async () => {
        return await window.electron.wsl.getDistributions();
    },
    install: async () => {
        return await window.electron.wsl.install();
    },
    setDefault: async (distribution: string) => {
        return await window.electron.wsl.setDefault(distribution);
    },
    import: async (distributionName: string, distributionPath: string, fileToImportPath: string) => {
        return await window.electron.wsl.import(distributionName, distributionPath, fileToImportPath);
    },
    openInstallationDocs: async () => {
        const buildVersion = await Windows.getBuildNumber();
        let url = wslInstallationDocs;
        if (buildVersion >= 19041) {
            url = wslInstallationDocsAfter19041;
        }

        openExternal(url);
    },
};
