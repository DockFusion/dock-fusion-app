import { getInstalledShells } from 'src/electron/utils/shells';

export async function getAvailableShells() {
    try {
        return await getInstalledShells();
    } catch (e) {
        console.error(e);
        return [];
    }
}
