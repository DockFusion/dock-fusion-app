export const DetectShells = {
    getAvailableShells: async () => {
        let installedShells = [];
        const key = 'installedShells';
        if (sessionStorage.getItem(key)) {
            installedShells = JSON.parse(sessionStorage.getItem('installedShells'));
        } else {
            installedShells = await window.electron.detectShells.getAvailableShells();
            sessionStorage.setItem(key, JSON.stringify(installedShells));
        }
        return installedShells;
    },
};
