const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");

let mainWindow;
let tray;
let isQuiting = false;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    process.exit(0);
}

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        show: false,
        autoHideMenuBar: true,
        backgroundColor: "#050505",

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    mainWindow.loadURL("http://127.0.0.1:5173");

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.webContents.openDevTools({
        mode: "detach"
    });

    mainWindow.webContents.on(
        "render-process-gone",
        (_, details) => {

            console.error(
                "Renderer crashed:",
                details
            );

            mainWindow.reload();
        }
    );

    mainWindow.webContents.on(
        "did-fail-load",
        (_, errorCode, errorDescription) => {

            console.error(
                "Failed loading UI:",
                errorCode,
                errorDescription
            );
        }
    );

    mainWindow.webContents.on(
        "console-message",
        (_, level, message) => {

            console.log(
                `[Renderer ${level}]`,
                message
            );
        }
    );

    mainWindow.on("close", (event) => {

        if (!isQuiting) {

            event.preventDefault();

            mainWindow.hide();
        }
    });
}

function createTray() {

    const iconPath = path.join(
        __dirname,
        "icon.png"
    );

    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Open HELIX",
            click: () => {
                mainWindow.show();
            }
        },

        {
            label: "Reload",
            click: () => {
                mainWindow.reload();
            }
        },

        {
            label: "Quit",
            click: () => {

                isQuiting = true;

                app.quit();
            }
        }
    ]);

    tray.setToolTip("HELIX");

    tray.setContextMenu(contextMenu);

    tray.on("click", () => {

        if (mainWindow.isVisible()) {
            mainWindow.hide();
        }

        else {
            mainWindow.show();
        }
    });
}

app.whenReady().then(() => {

    createWindow();

    createTray();
});

app.on("before-quit", () => {
    isQuiting = true;
});

app.on("window-all-closed", (e) => {
    e.preventDefault();
});