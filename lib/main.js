const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow; // Create window for app
const dialog = electron.dialog;
const fs = require('fs');
const Menu = electron.Menu;

var mainWindow = null;

// Spin up app
app.on('ready', function() {
 	console.log('The application is ready.');
	
	// set up custom menu
	var menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

 	mainWindow = new BrowserWindow();
	mainWindow.webContents.openDevTools(); // access Chrome Dev Tools
	mainWindow.loadURL('file://' + __dirname + '/index.html');

	// Set window to null when closed
 	mainWindow.on('closed', function() {
 		mainWindow = null;
	});
});

// dialog
const openFile = function() {
	var files = dialog.showOpenDialog(mainWindow, {
		properties: ['openFile'],
		filters: [ // filter file types app will open
			{ name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
		]
	});

	if (!files) {return}

	var file = files[0];
	app.addRecentDocument(file); // add opened file to recents list
	var content = fs.readFileSync(file).toString();
	mainWindow.webContents.send('file-opened', file, content);
};

app.on('open-file', function(event, file) {
	var content = fs.readFileSync(file).toString();
	mainWindow.webContents.send('file-opened', file, content);
});

const saveFile = function(content) {
	var fileName = dialog.showSaveDialog(mainWindow, {
		title: 'Save HTML Output',
		defaultPath: app.getPath('documents'),
		filters: [
			{ name: 'HTML Files', extensions: ['html'] }
		]
	});

	if (!fileName) { return; }

	fs.writeFileSync(fileName, content);
};

exports.openFile = openFile;
exports.saveFile = saveFile;

// use this to customize menu
const template = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Open',
				accelerator: 'CmdOrCtrl+O',
				click() { openFile(); }
			},
			{
				label: 'Save',
				accelerator: 'CmdOrCtrl+S',
				click() { saveFile(); }
			}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{
				label: 'Undo',
				accelerator: 'CmdOrCtrl+Z',
				role: 'undo'
			},
			{
				label: 'Redo',
				accelerator: 'Shift+CmdOrCtrl+Z',
				role: 'redo'
			},
			{
				type: 'separator'
			},
			{
				label: 'Cut',
				accelerator: 'CmdOrCtrl+X',
				role: 'cut'
			},
			{
				label: 'Copy',
				accelerator: 'CmdOrCtrl+C',
				role: 'copy'
			},
			{
				label: 'Paste',
				accelerator: 'CmdOrCtrl+V',
				role: 'paste'
			},
			{
				label: 'Select All',
				accelerator: 'CmdOrCtrl+A',
				role: 'selectall'
			},
		]
	}
];

// For OS X only
if (process.platform == 'darwin') {
	var name = app.getName();
	template.unshift({
		label: name,
		submenu: [
			{
				label: 'About ' + name,
				role: 'about'
			},
			{
				type: 'separator'
			},
			{
				label: 'Services',
				role: 'services',
				submenu: []
			},
			{
				type: 'separator'
			},
			{
				label: 'Hide ' + name,
				accelerator: 'Command+H',
				role: 'hide'
			},
			{
				label: 'Hide Others',
				accelerator: 'Command+Alt+H',
				role: 'hideothers'
			},
			{
				label: 'Show All',
				role: 'unhide'
			},
			{
				type: 'separator'
			},
			{
				label: 'Adriana is Awesome',
			},
			{
				type: 'separator'
			},
			{
				label: 'Quit',
				accelerator: 'Command+Q',
				click() { app.quit(); }
			},
		]
	});
}
