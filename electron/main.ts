import { register } from 'tsconfig-paths';
const path = require('path');
const url = require('url');

register({
    baseUrl: './',
    paths: {
        'shared/*': [path.join(__dirname, '../src/shared') + '/*'],
        'assets/*': [path.join(__dirname, '../assets') + '/*'],
        'src/*': [__dirname + '/*'],
        '@/*': [path.join(__dirname, '../../../') + '/*'],
    },
});

// Modules to control application life and create native browser window
import { app, BrowserWindow, net, protocol, shell } from 'electron';
import { appName, homeAppDataFolderName } from 'shared/constants';
import './ipcMain/child_process';
import './ipcMain/detectEditors';
import './ipcMain/detectShells';
import './ipcMain/dockerode';
import './ipcMain/github';
import './ipcMain/self';
import './ipcMain/shell';
import './ipcMain/windows';
import './ipcMain/wsl';
import { isDarwin, trackContainerStatus } from './utils';

function isDev() {
    return !app.isPackaged;
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
    app.quit();
} else {
    app.on('second-instance', (_event: Electron.Event, argv: string[]) => {
        app.focus();
    });
}

const productName = `DockFusion${isDev() ? '-dev' : ''}`;
app.setName(productName);
app.setPath('userData', path.join(app.getPath('appData'), productName));

async function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: appName,
        skipTaskbar: false, // can be used to start the app without the window visible
        minWidth: 550,
        minHeight: 250,
        darkTheme: true,
        center: true,
        kiosk: false, // fullscreen borderless
        width: 800,
        height: 600,
        icon: isDev() ? path.join(__dirname, '../../../assets/app-logo.ico') : undefined,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: isDev(),
            contextIsolation: true,
        },
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.webContents.setWindowOpenHandler((details) => {
        const url = details.url;
        if (url.startsWith('file://')) {
            return { action: 'allow' };
        }

        // open url in a browser and prevent default
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // and load the index.html of the app.
    // mainWindow.loadFile('index.html');
    await mainWindow.loadURL('http://localhost:3000');

    // Open the DevTools.
    if (isDev()) {
        // Open the DevTools and also disable Electron Security Warning.
        (process.env as any).ELECTRON_DISABLE_SECURITY_WARNINGS = true;
        mainWindow.webContents.openDevTools({
            mode: 'detach',
        });
    }

    await trackContainerStatus();

    mainWindow.once('focus', () => mainWindow.flashFrame(false));
    mainWindow.flashFrame(true);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    protocol.handle('githubdownloads', (request) => {
        const filePath = request.url.slice('githubdownloads://'.length);
        const downloadPath = path.join(app.getPath('userData'), 'githubDownloads', filePath);

        return net.fetch(url.pathToFileURL(downloadPath).toString());
    });

    protocol.handle('appdownloads', (request) => {
        const filePath = request.url.slice('appdownloads://'.length);
        const downloadPath = path.join(app.getPath('home'), homeAppDataFolderName, 'apps', filePath);

        return net.fetch(url.pathToFileURL(downloadPath).toString());
    });

    await createWindow();

    app.on('activate', async function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            await createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (!isDarwin()) {
        app.quit();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
