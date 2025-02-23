import { getInstalledEditors, openWithEditor } from 'src/electron/utils/editors';
import { Editor } from 'src/shared/enums';

export async function getAvailableEditors() {
    try {
        return await getInstalledEditors();
    } catch (e) {
        return [];
    }
}

export async function openPathInEditor(_: any, editor: Editor, filePath: string) {
    try {
        return await openWithEditor(editor, filePath);
    } catch (e) {
        return [];
    }
}
