const electron = require('electron');
const ipc = electron.ipcRenderer; // allows communication to main.js
const $ = require('jquery');
const marked = require('marked');
const remote = electron.remote; // access native os api
const mainProcess = remote.require('./main');
const clipboard = remote.clipboard;
const shell = electron.shell;

// renderer receives content from main over the file-opened channel (arbitrary name)

// cache selectors
const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $openFileButton = $('#open-file');
const $saveFileButton = $('#save-file');
const $copyHtmlButton = $('#copy-html');
const $showInFileSystemButton = $('#show-in-file-system');
const $openInDefaultEditorButton = $('#open-in-default-editor');

var currentFile = null;

// listener:
ipc.on('file-opened', function(event, file, content) {
	currentFile = file;
  console.log(currentFile);
	$showInFileSystemButton.attr('disabled', false);
	$openInDefaultEditorButton.attr('disabled', false);

	$markdownView.text(content);
	renderMarkdownToHtml(content);
});

// resuable markdown conversion
function renderMarkdownToHtml(markdown) {
	var html = marked(markdown);
	$htmlView.html(html);
}

// listen for key entry
$markdownView.on('keyup', function() {
	var content = $(this).val();
	renderMarkdownToHtml(content);
});

// listeners for buttons
$showInFileSystemButton.on('click', () => {
	shell.showItemInFolder(currentFile);
});

$openInDefaultEditorButton.on('click', () => {
	shell.openItem(currentFile);
});

$openFileButton.on('click', () => {
	mainProcess.openFile();
});

$copyHtmlButton.on('click', ()  => {
	var html = $htmlView.html();
	clipboard.writeText(html);
});

$saveFileButton.on('click', () => {
	var html = $htmlView.html();
	mainProcess.saveFile(html);
});

$(document).on('click', 'a[href^="http"]', function(event) {
	event.preventDefault();
	shell.openExternal(this.href);
});
