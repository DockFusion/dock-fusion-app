import { ipcMain } from 'electron';
import { getInstalledShells } from 'src/utils/shells';

ipcMain.handle('detectShells.getAvailableShells', async function () {
    try {
        return await getInstalledShells();
    } catch (e) {
        console.error(e);
        return [];
    }
});
