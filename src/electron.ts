import { register } from 'tsconfig-paths';
const path = require('path');
const url = require('url');

register({
    baseUrl: './',
    paths: {
        'src/*': [__dirname + '/*'],
        '@/*': [path.join(__dirname, '../') + '/*'],
    },
});

// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu, nativeImage, net, protocol, shell, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import { appName, homeAppDataFolderName } from 'src/shared/constants';
import './electron/ipcMain/child_process';
import './electron/ipcMain/detectEditors';
import './electron/ipcMain/detectShells';
import './electron/ipcMain/dockerode';
import './electron/ipcMain/github';
import './electron/ipcMain/self';
import './electron/ipcMain/shell';
import './electron/ipcMain/windows';
import './electron/ipcMain/wsl';
import { isDarwin, trackContainerStatus } from './electron/utils';

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
let mainWindow: BrowserWindow;
(app as any).isQuitting = false;

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: appName,
        skipTaskbar: false, // can be used to start the app without the window visible
        minWidth: 550,
        minHeight: 250,
        darkTheme: true,
        center: true,
        kiosk: false, // fullscreen borderless
        width: 800,
        height: 600,
        icon: isDev() ? path.join(__dirname, '../assets/app-logo.ico') : undefined,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            preload: path.join(__dirname, './electron/preload.js'),
            // devTools: isDev(),
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

    let startURL = 'http://localhost:3000';
    if (app.isPackaged || process.env.ENV == 'prod' || true) {
        startURL = `file://${path.join(__dirname, 'index.html')}`;
    }
    await mainWindow.loadURL(startURL);

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

    mainWindow.on('close', (event) => {
        if (!(app as any).isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
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

    const tray = new Tray(
        nativeImage.createFromPath(path.join(app.getAppPath(), isDev() ? '..' : '', 'assets/app-logo.png')),
    );
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open DockFusion',
            click: function () {
                mainWindow.show();
            },
        },
        {
            label: 'Quit',
            click: function () {
                app.quit();
            },
        },
    ]);
    tray.on('click', () => {
        mainWindow.show();
    });
    tray.setToolTip('Open DockFusion');
    tray.setContextMenu(contextMenu);

    // autoUpdater.on('update-available', () => {
    //     console.log('Update available!');
    //     mainWindow.webContents.send('update-available');
    // });

    // autoUpdater.on('update-not-available', () => {
    //     console.log('No update available.');
    //     mainWindow.webContents.send('update-not-available');
    // });

    // autoUpdater.on('error', (error) => {
    //     console.error('Error during update:', error);
    //     mainWindow.webContents.send('update-error', error.message);
    // });

    // autoUpdater.on('update-downloaded', () => {
    //     console.log('Update downloaded!');
    //     mainWindow.webContents.send('update-downloaded');
    // });

    autoUpdater.checkForUpdatesAndNotify();
});

app.on('before-quit', (event) => {
    (app as any).isQuitting = true;
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
