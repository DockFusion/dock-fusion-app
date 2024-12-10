export const DetectEditors = {
    getAvailableEditors: async () => {
        let installedEditors = [];
        const key = 'installedEditors';
        if (sessionStorage.getItem(key)) {
            installedEditors = JSON.parse(sessionStorage.getItem('installedEditors'));
        } else {
            installedEditors = await window.electron.detectEditors.getAvailableEditors();
            sessionStorage.setItem(key, JSON.stringify(installedEditors));
        }
        return installedEditors;
    },
};
