// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron')
var fs = require("fs");

const selectFileBtn = document.getElementById('select-file')

selectFileBtn.addEventListener('click', function (event) {
    ipcRenderer.send('open-file-dialog')
})

ipcRenderer.on('selectedItem', function (event, path) {
    loadUI("main", path[0]);
})

const saveBtn = document.getElementById('save-dialog')

saveBtn.addEventListener('click', (event) => {
    ipcRenderer.send('save-dialog')
})

ipcRenderer.on('saved-file', (event, path) => {
    if (path)
        doSaveFile(path);
})
