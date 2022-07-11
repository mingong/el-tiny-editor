const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');

const url = require('url');
const path = require('path');
const fs = require('fs');

const beautify = require('js-beautify').html;

const isDev = process.mainModule.filename.indexOf('app.asar') < 0;

let mainWindow;

if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1040,
    height: 826,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      webSecurity: false,
      contextIsolation: false
    }
  });
  
  mainWindow.removeMenu();
  
  // "and load the index.html of the app."
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    /*
    slashes: true,
    */
    slashes: true
  }));
  
  if (isDev) {
    // "Open the DevTools."
    /*
    BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    
    */
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.webContents.send('action', 'exiting');
  });
  
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('call-set', (event, arg) => choose_working_directory(event));
/*
ipcMain.on('call-eso', (event, arg) => esoohc_working_directory(event));
*/

ipcMain.on('call-new', (event, arg) => newfile());
ipcMain.on('call-load', (event, arg) => load());
ipcMain.on('call-save', (event, arg) => save());
ipcMain.on('call-save-', (event, arg) => save_(arg));
ipcMain.on('call-saveAs', (event, arg) => saveas());

ipcMain.on('call-quit', (event, arg) => app.exit());

ipcMain.on('call-get', (event, arg) => get(event, arg));

/*
let filename;

let working_directory;
*/
let filename = null;

let working_directory = "";

function choose_working_directory(event) {
  if (filename) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      detail: 'Can Not Choose Working Directory.'
    });
    
    event.returnValue = "";
  } else {
    dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"], defaultPath: working_directory }).then((fn) => {
      if (fn.canceled) {
        event.returnValue = "";
      } else {
        var pathName = fn.filePaths[0];
        
        change_working_directory(pathName);
        
        event.returnValue = pathName;
      }
    });
  }
}

/*
function esoohc_working_directory(event) {
  if (filename) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      detail: 'Can Not Esoohc Working Directory.'
    });
    
    event.returnValue = "";
  } else {
    if (working_directory.length > 0) {
      working_directory = "";
      
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        detail: 'Esoohc Working Directory.'
      });
      
      event.returnValue = __dirname;
    } else {
      dialog.showMessageBox(mainWindow, {
        type: 'info',

        detail: 'Do Not Need To Esoohc Working Directory.'
      });
      
      event.returnValue = "";
    }
  }
}

*/
function newfile() {
  filename = null;
  
  working_directory = "";
  
  mainWindow.webContents.send('newly-made-file', __dirname);
}

function load() {
  dialog.showOpenDialog(mainWindow, { properties: ["openFile"], defaultPath: working_directory }).then((fn) => {
    // Prevent error message if click cancel
    if (fn.canceled) {
      return;
    }

    var filePath = fn.filePaths[0];

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      
      var pathName = path.dirname(filePath);
      
      change_working_directory(pathName);

      filename = path.basename(filePath);
      
      mainWindow.webContents.send('new-file', pathName, /*filename, */data);
    });
    
    return;
  });
}

function save() {
  if (filename) {
    mainWindow.webContents.send('saved-file', working_directory/*, filename*/);
    
    return;
  } else {
    var fullPath = working_directory;

    var options = {
      filters: [
        { name: 'HTML Files', extensions: ['htm', 'html'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      defaultPath: fullPath
    };

    dialog.showSaveDialog(mainWindow, options).then((n) => {
      if (n.canceled) {
        return; // canceled
      } else {
        var filepath = n.filePath;
        
        var pathname = path.dirname(filepath);
        
        change_working_directory(pathname);
        
        if (path.extname(filepath) == "") {
          filepath += ".html";
        }
        
        filename = path.basename(filepath);
        
        mainWindow.webContents.send('saved-file', pathname/*, filename*/);
        
        return;
      }
    });
  }
}

function save_(result) {
  var fullpath;
  
  fullpath = path.join(working_directory, filename);
  
  fs.writeFile(fullpath, beautify(result, { indent_size: 2 }), (err) => {
    if (err) throw err;

  });
}

function saveas() {
  var fullPath;

  if (filename) {
    fullPath = path.join(working_directory, filename);
  } else {
    fullPath = working_directory;
  }
  
  var options = {
    filters: [
      { name: 'HTML Files', extensions: ['htm', 'html'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    defaultPath: fullPath
  };

  dialog.showSaveDialog(mainWindow, options).then((n) => {
    if (n.canceled) {
      return; // canceled
    } else {
      var filepath = n.filePath;
      
      var pathname = path.dirname(filepath);
      
      change_working_directory(pathname);
      
      if (path.extname(filepath) == "") {
        filepath += ".html";
      }
      
      filename = path.basename(filepath);
      
      mainWindow.webContents.send('saved-file', pathname/*, filename*/);
      
      return;
    }
  });
}

function change_working_directory(new_path) {
  working_directory = new_path;
}

function get(event, arg) {
  var options;
  
  if (arg == "file") {
    options = {
      properties: ["openFile"],
      defaultPath: working_directory
    };
  }
  
  if (arg == "image") {
    options = {
      properties: ["openFile"],
      filters: [
        { name: "images", extensions: ["jpg", "png", "gif", "svg"] }
      ],
      defaultPath: working_directory
    };
  }
  
  dialog.showOpenDialog(mainWindow, options).then((fn) => {
    //
    if (fn.canceled) {
      event.returnValue = "";
    } else {
      event.returnValue = fn.filePaths[0];
    }
  });
}
