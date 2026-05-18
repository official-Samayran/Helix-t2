const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1600,
        height: 950,
        backgroundColor: "#000000",
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload.cjs")
        }
    });

    mainWindow.loadURL(
        "http://localhost:5173"
    );

    mainWindow.on(
        "closed",
        () => {
            mainWindow = null;
        }
    );
}

app.whenReady().then(() => {

    createWindow();

    app.on(
        "activate",
        () => {

            if (
                BrowserWindow.getAllWindows().length === 0
            ) {
                createWindow();
            }
        }
    );
});

app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {
            app.quit();
        }
    }
);