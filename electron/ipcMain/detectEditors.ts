import { ipcMain } from 'electron';
import { Editor } from 'shared/enums';
import { getInstalledEditors, openWithEditor } from 'src/utils/editors';

ipcMain.handle('detectEditors.getAvailableEditors', async function () {
    try {
        return await getInstalledEditors();
    } catch (e) {
        return [];
    }
});

ipcMain.handle('detectEditors.openPathInEditor', async function (_: any, editor: Editor, filePath: string) {
    try {
        return await openWithEditor(editor, filePath);
    } catch (e) {
        return [];
    }
});
