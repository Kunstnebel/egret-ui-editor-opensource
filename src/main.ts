import { app } from 'electron';
import { initialize as initializeRemote } from '@electron/remote/main';
import { ElectronMain } from './egret/code/electron-main/main';
import { parseArgs } from 'egret/platform/environment/node/argv';
import { ParsedArgs } from 'egret/platform/environment/common/args';

initializeRemote();

// Must be set before app ready
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('lang', 'en-US');

// macOS: when dragging a file onto a dock icon while the app is not running,
// open-file fires before ready. Remember the path so we can open it after startup.
app.on('open-file', (event: Event, path: string) => {
	global['macOpenFile'] = path;
});

app.on('ready', () => {
	let args: ParsedArgs;
	try {
		args = parseArgs(process.argv);
		// args = validatePaths(args);
	} catch (err) {
		console.error(err.message);
		app.exit(1);

		return;
	}

	const main = new ElectronMain();
	main.startup(args);
});