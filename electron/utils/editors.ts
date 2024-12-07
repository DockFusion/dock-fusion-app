import { exec } from 'child_process';
import { Editor } from 'shared/enums';
import { IEditor } from 'shared/interfaces';

const which = require('which');

// Function to get the name of the editor from the enum
function getEditorName(editor: Editor): string {
    switch (editor) {
        case Editor.VisualStudioCode:
            return 'Visual Studio Code';
        case Editor.SublimeText:
            return 'Sublime Text';
        case Editor.Vim:
            return 'Vim';
        case Editor.Nano:
            return 'Nano';
        case Editor.Atom:
            return 'Atom';
        case Editor.Brackets:
            return 'Brackets';
        case Editor.Emacs:
            return 'Emacs';
        case Editor.IntelliJ:
            return 'IntelliJ IDEA';
        case Editor.WebStorm:
            return 'WebStorm';
        case Editor.PyCharm:
            return 'PyCharm';
        case Editor.CLion:
            return 'CLion';
        case Editor.AndroidStudio:
            return 'Android Studio';
        case Editor.Xcode:
            return 'Xcode';
        case Editor.Eclipse:
            return 'Eclipse';
        case Editor.NetBeans:
            return 'NetBeans';
        case Editor.Komodo:
            return 'Komodo IDE';
        case Editor.NotepadPlusPlus:
            return 'Notepad++';
        case Editor.Gedit:
            return 'Gedit';
        case Editor.Kate:
            return 'Kate';
        case Editor.Bluefish:
            return 'Bluefish';
        case Editor.Geany:
            return 'Geany';
        case Editor.TextMate:
            return 'TextMate';
        case Editor.LightTable:
            return 'Light Table';
        case Editor.Jupyter:
            return 'Jupyter Notebook';
        case Editor.Spacemacs:
            return 'Spacemacs';
        case Editor.VSCodium:
            return 'VSCodium';
        case Editor.CodeBlocks:
            return 'Code::Blocks';
        case Editor.VisualStudio:
            return 'Visual Studio';
        case Editor.XEmacs:
            return 'XEmacs';
        case Editor.Pico:
            return 'Pico';
        default:
            return 'Unknown Editor';
    }
}

// async function getRegistryValue(key: string): Promise<string | undefined> {
//     return new Promise((resolve, reject) => {
//       regedit.list(key, (err, result) => {
//         if (err || !result[key]) {
//           resolve(undefined);
//         } else {
//           resolve(result[key].values['InstallLocation']?.value);
//         }
//       });
//     });
//   }

// List of editors and their corresponding command-line invocations
const editors = [
    { editor: Editor.VisualStudioCode, cmd: 'code' },
    { editor: Editor.SublimeText, cmd: 'subl' },
    { editor: Editor.Vim, cmd: 'vim' },
    { editor: Editor.Nano, cmd: 'nano' },
    { editor: Editor.Atom, cmd: 'atom' },
    { editor: Editor.Brackets, cmd: 'brackets' },
    { editor: Editor.Emacs, cmd: 'emacs' },
    { editor: Editor.IntelliJ, cmd: 'idea' },
    { editor: Editor.WebStorm, cmd: 'webstorm' },
    { editor: Editor.PyCharm, cmd: 'pycharm' },
    { editor: Editor.CLion, cmd: 'clion' },
    { editor: Editor.AndroidStudio, cmd: 'android-studio' },
    { editor: Editor.Xcode, cmd: 'xcode' },
    { editor: Editor.Eclipse, cmd: 'eclipse' },
    { editor: Editor.NetBeans, cmd: 'netbeans' },
    { editor: Editor.Komodo, cmd: 'komodo' },
    { editor: Editor.NotepadPlusPlus, cmd: 'notepad++' },
    { editor: Editor.Gedit, cmd: 'gedit' },
    { editor: Editor.Kate, cmd: 'kate' },
    { editor: Editor.Bluefish, cmd: 'bluefish' },
    { editor: Editor.Geany, cmd: 'geany' },
    { editor: Editor.TextMate, cmd: 'textmate' },
    { editor: Editor.LightTable, cmd: 'lighttable' },
    { editor: Editor.Jupyter, cmd: 'jupyter-notebook' },
    { editor: Editor.Spacemacs, cmd: 'spacemacs' },
    { editor: Editor.VSCodium, cmd: 'vscodium' },
    { editor: Editor.CodeBlocks, cmd: 'codeblocks' },
    { editor: Editor.VisualStudio, cmd: 'devenv' },
    { editor: Editor.XEmacs, cmd: 'xemacs' },
    { editor: Editor.Pico, cmd: 'pico' },
];

// Function to check if an editor is installed and return the result
export async function getInstalledEditors(): Promise<IEditor[]> {
    const installedEditors: IEditor[] = [];

    for (const { editor, cmd } of editors) {
        try {
            const path = which.sync(cmd); // Check if the command exists in PATH
            installedEditors.push({
                editor,
                name: getEditorName(editor),
                cmd: path, // Return the path to the executable
            });
        } catch (error) {
            // Editor is not installed or not in PATH
        }
    }

    return installedEditors;
}

export function openWithEditor(editor: Editor, filePath: string): void {
    const editorDetails = editors.find((e) => e.editor === editor);

    if (!editorDetails) {
        console.error('Editor not found!');
        return;
    }

    const cmd = editorDetails.cmd;
    exec(`${cmd} "${filePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error opening with ${getEditorName(editor)}:`, stderr);
        } else {
            console.log(`${getEditorName(editor)} opened ${filePath}`);
        }
    });
}
