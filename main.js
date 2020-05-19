const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')

// load util and fs from node
const util = require('util')
const fs = require('fs')


// declare this as a variable globally so we can
// reference it and os it will not be garbage collected
let mainWindow;

// make fs.stat able to use promises (instead of callbacks)
const stat = util.promisify(fs.stat)

ipcMain.on('files', async (event, filesArr) => {
    try {
        // asynchronously get the data for all the files
        const data = await Promise.all(
            filesArr.map(async ({ name, pathName }) => ({
                ...await stat(pathName),
                name,
                pathName
            }))
        )

        // remember we declared mainWindow ourselves
        // when we created a new browser window
        mainWindow.webContents.send('metadata', data)
    } catch (error) {
        // send an error event if something goes wrong
        mainWindow.webContents.send('metadata:error', error)
    }
});


// wait for the main process to be ready
app.on('ready', () => {
    // path to our html
    const htmlPath = path.join('src', 'index.html')

    // create a browser window
    // nodeIntegration solves require not defined error
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
    })

    mainWindow.loadFile(htmlPath)
});