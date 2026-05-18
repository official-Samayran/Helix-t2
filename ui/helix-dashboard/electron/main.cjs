const { app, BrowserWindow } = require("electron");

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: "#050505",

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL(
        "http://127.0.0.1:5173"
    );

    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on(
        "did-fail-load",
        (_, errorCode, errorDescription) => {

            console.log(
                "Failed loading UI:",
                errorCode,
                errorDescription
            );
        }
    );

    mainWindow.webContents.on(
        "render-process-gone",
        (_, details) => {

            console.log(
                "Renderer crashed:",
                details
            );
        }
    );
}

app.whenReady().then(() => {

    createWindow();
});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }
});