import { app } from 'electron';

import * as paths from 'path';
import * as fs from 'fs';

let initLocalizationed: boolean = false;
// Current UI language file name (forced to English)
let nlsFileName = '';
// Localization directory
let nlsDir = '';

/**
 * Resolve app path without relying on the deprecated electron.remote module.
 */
function getAppPath(): string {
	if (app) {
		return app.getAppPath();
	}
	try {
		// Renderer / utility processes: use @electron/remote when available
		const electronRemote = require('@electron/remote');
		if (electronRemote && electronRemote.app) {
			return electronRemote.app.getAppPath();
		}
	} catch (_e) { /* ignore */ }
	return process.cwd();
}

/**
 * Initialize localization. UI language is always English (en_US).
 * @param debug debug mode writes localization config locally
 */
function initLocalization(): void {
	if (initLocalizationed) {
		return;
	}
	initLocalizationed = true;
	// Force English UI regardless of OS locale
	const currentLocalName = 'en_US';
	nlsDir = paths.join(getAppPath(), 'nls');
	nlsFileName = 'nls.metadata.' + currentLocalName + '.json';
	doInitLocalization(paths.join(nlsDir, nlsFileName));
}

let nlsData;
function doInitLocalization(nlsPath: string): void {
	nlsData = null;
	if (fs.existsSync(nlsPath)) {
		const nlsDataStr = fs.readFileSync(nlsPath, 'utf8');
		try {
			nlsData = JSON.parse(nlsDataStr);
		} catch (error) { }
	}
	if (!nlsData) {
		nlsData = {};
	}
}

/**
 * Localize a message
 * @param key localization key
 * @param message default English text
 * @param args message format args
 */
export function localize(key: string, message: string, ...args: (string | number | boolean | undefined | null)[]): string {
	initLocalization();
	let result = message;
	if (key in nlsData && 't' in nlsData[key]) {
		result = nlsData[key]['t'];
	}
	if (args && args.length > 0) {
		for (let i = 0; i < args.length; i++) {
			result = result.replace('{' + i + '}', args[i].toString());
		}
	}
	return result;
}
