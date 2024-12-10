import { exec, ExecException, execSync } from 'child_process';
import { ipcMain } from 'electron';

ipcMain.handle('child_process.execSync', async function (_: any, command: string) {
    return execSync(command);
});

ipcMain.handle(
    'child_process.exec',
    async function (
        _: any,
        command: string,
        callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
    ) {
        exec(command, callback);
    },
);
