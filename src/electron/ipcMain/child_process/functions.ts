import childProcess, { ExecException } from 'child_process';
import { IpcMainInvokeEvent } from 'electron';

export async function execSync(_: IpcMainInvokeEvent, command: string) {
    return childProcess.execSync(command);
}

export async function exec(
    _: IpcMainInvokeEvent,
    command: string,
    callback?: (error: ExecException | null, stdout: string, stderr: string) => void,
) {
    childProcess.exec(command, callback);
}
