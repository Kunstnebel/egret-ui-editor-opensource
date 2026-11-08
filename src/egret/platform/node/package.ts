import * as path from 'path';
import * as fsextra from 'fs-extra';
import { app } from 'electron';

export interface IPackageConfiguration {
	name: string;
	version: string;
}

function getAppRootPath(): string {
	if (app) {
		return app.getAppPath();
	}
	// Renderer process only — never import @electron/remote in the main process
	const electronRemote = require('@electron/remote');
	return electronRemote.app.getAppPath();
}

const rootPath: string = getAppRootPath();
const packageJsonPath = path.join(rootPath, 'package.json');
console.log(packageJsonPath);
const configuration = fsextra.readJsonSync(packageJsonPath) as IPackageConfiguration;

export default configuration;
