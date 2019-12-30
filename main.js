const url = require("url");
const path = require("path");
const electron = require("electron")
const {
    app,
    Menu,
    BrowserWindow
} = electron;

var menu = [
    {
        label: "File",
        submenu: [{
            label: "New Window",
            accelerator: "CmdOrCtrl+N",
            click: function() {
                createWindow();
            }
        },{
            label: "Export",
            accelerator: "CmdOrCtrl+E",
            click: function() {
                BrowserWindow.getFocusedWindow().webContents.send("Export");
            }
        },{
            type: "separator"
        },{
            label: "Close Window",
            accelerator: "CmdOrCtrl+W",
            role: "close"
        }]
    },{
        label: "Edit",
        submenu: [{
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            role: "undo"
        }, {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            role: "redo"
        }, {
            type: "separator"
        }, {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            role: "cut"
        }, {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            role: "copy"
        }, {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            role: "paste"
        }, {
            type: "separator"
        }, {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            role: "selectall"
        }]
    },{
        label: "Navigate",
        submenu: [{
            label: "Home",
            accelerator: "CmdOrCtrl+R",
            click: function() {
                BrowserWindow.getFocusedWindow().webContents.send("Home");
            }
        }]
    }
];
if (process.platform === "darwin") {
    const name = electron.app.name;
    menu.unshift({
        label: name,
        submenu: [{
            label: `About ${name}`,
            role: "about"
        }, {
            type: "separator"
        }, {
            label: "Service",
            role: "services",
            submenu: []
        }, {
            type: "separator"
        }, {
            label: `Hide ${name}`,
            accelerator: "Command+H",
            role: "hide"
        }, {
            label: "Hide Other",
            accelerator: "Command+Alt+H",
            role: "hideothers"
        }, {
            label: "Show all",
            role: "unhide"
        }, {
            type: "separator"
        }, {
            label: `Quit ${name}`,
            accelerator: "Command+Q",
            click: function () {
                app.quit()
            }
        }]
    })
}
/*
    {
    label: 'Switching Developer Tools',
        accelerator: (function () {
            if (process.platform === 'darwin') {
                return 'Alt+Command+I'
            } else {
                return 'Ctrl+Shift+I'
            }
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    }
*/
app.on("ready", createWindow);

app.on("window-all-closed", () => {
    // darwin = MacOS
    // if (process.platform !== "darwin") {
    app.quit();
    // }
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

function createWindow() {
    var transparent = process.platform === "darwin";
    win = new BrowserWindow({
        width: 700,
        height: 600,
        minWidth: 700,
        minHeight: 600,
        backgroundColor: "#404040",
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }));
    win.on("closed", () => {
        win = null;
    });
    win.webContents.on("did-finish-load", () => {
        win.webContents.send("Download-folder", app.getPath("downloads"));
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
