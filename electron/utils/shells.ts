import { exec } from 'child_process';
import { Shell } from 'shared/enums';
import { IShell } from 'shared/interfaces';

const which = require('which');

const shells = [
    { shell: Shell.Bash, cmd: 'bash' },
    { shell: Shell.Zsh, cmd: 'zsh' },
    { shell: Shell.Fish, cmd: 'fish' },
    { shell: Shell.PowerShell, cmd: 'powershell' },
    { shell: Shell.Cmd, cmd: 'cmd' },
    { shell: Shell.FishShell, cmd: 'fish' },
    { shell: Shell.Csh, cmd: 'csh' },
    { shell: Shell.Tcsh, cmd: 'tcsh' },
    { shell: Shell.Dash, cmd: 'dash' },
    { shell: Shell.Elvish, cmd: 'elvish' },
    { shell: Shell.Ion, cmd: 'ion' },
    { shell: Shell.Xonsh, cmd: 'xonsh' },
    { shell: Shell.Mksh, cmd: 'mksh' },
    { shell: Shell.Ash, cmd: 'ash' },
    { shell: Shell.Ksh, cmd: 'ksh' },
    { shell: Shell.Fsh, cmd: 'fsh' },
    { shell: Shell.BusyBoxSh, cmd: 'busybox sh' },
    { shell: Shell.Nushell, cmd: 'nushell' },
    { shell: Shell.PlainSh, cmd: 'sh' },
    { shell: Shell.GitBash, cmd: 'bash' }, // Git Bash for Windows
    { shell: Shell.AlacrittyShell, cmd: 'alacritty' }, // Alacritty as shell terminal
    { shell: Shell.WSL, cmd: 'wsl' }, // Windows Subsystem for Linux
    { shell: Shell.Termux, cmd: 'termux' }, // Termux on Android
    { shell: Shell.UbuntuShell, cmd: 'bash' }, // Ubuntu default shell (usually bash)
    { shell: Shell.Cygwin, cmd: 'bash' }, // Cygwin shell for Windows
    { shell: Shell.Cmder, cmd: 'cmder' }, // Cmder shell for
    { shell: Shell.WindowsTerminal, cmd: 'wt' }, // Windows Terminal
];

// Function to get the name of the shell from the enum
function getShellName(shell: Shell): string {
    switch (shell) {
        case Shell.Bash:
            return 'Bash';
        case Shell.Zsh:
            return 'Zsh';
        case Shell.Fish:
            return 'Fish';
        case Shell.PowerShell:
            return 'PowerShell';
        case Shell.Cmd:
            return 'Cmd';
        case Shell.FishShell:
            return 'FishShell';
        case Shell.Csh:
            return 'Csh';
        case Shell.Tcsh:
            return 'Tcsh';
        case Shell.Dash:
            return 'Dash';
        case Shell.Elvish:
            return 'Elvish';
        case Shell.Ion:
            return 'Ion';
        case Shell.Xonsh:
            return 'Xonsh';
        case Shell.Mksh:
            return 'Mksh';
        case Shell.Ash:
            return 'Ash';
        case Shell.Ksh:
            return 'Ksh';
        case Shell.Fsh:
            return 'Fsh';
        case Shell.BusyBoxSh:
            return 'BusyBoxSh';
        case Shell.Nushell:
            return 'Nushell';
        case Shell.PlainSh:
            return 'PlainSh';
        case Shell.GitBash:
            return 'GitBash';
        case Shell.AlacrittyShell:
            return 'AlacrittyShell';
        case Shell.WSL:
            return 'WSL';
        case Shell.Termux:
            return 'Termux';
        case Shell.UbuntuShell:
            return 'UbuntuShell';
        case Shell.Cygwin:
            return 'Cygwin';
        case Shell.Cmder:
            return 'Cmder';
        case Shell.WindowsTerminal:
            return 'Windows Terminal'; // Windows Terminal
        default:
            return 'Unknown Shell';
    }
}

export async function getInstalledShells(): Promise<IShell[]> {
    const installedShells: IShell[] = [];

    // Check each shell command and see if it is available
    for (const { shell, cmd } of shells) {
        try {
            const path = which.sync(cmd); // Check if the command exists in PATH
            installedShells.push({
                shell,
                name: getShellName(shell),
                cmd: path, // Return the path to the executable
            });
        } catch (error) {
            // Shell not found, continue to the next one
        }
    }

    return installedShells;
}

// Function to open a file or folder with the requested shell
export function openWithShell(shell: Shell, filePath: string): void {
    const shellDetails = shells.find((s) => s.shell === shell);

    if (!shellDetails) {
        console.error('Shell not found!');
        return;
    }

    const cmd = shellDetails.cmd;
    exec(`${cmd} "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening with ${getShellName(shell)}:`, stderr);
        } else {
            console.log(`${getShellName(shell)} opened ${filePath}`);
        }
    });
}
