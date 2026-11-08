const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

const projectPath = process.argv[2] || path.join('D:', 'murpg', 'murpg-egret');
const child = spawn(electron, ['.', projectPath], {
	cwd: path.join(__dirname, '..'),
	stdio: 'inherit',
	windowsHide: false
});

child.on('exit', (code) => process.exit(code == null ? 0 : code));
