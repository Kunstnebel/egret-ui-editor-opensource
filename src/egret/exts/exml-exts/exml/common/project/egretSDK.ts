import { exec } from 'egret/base/common/cmd';
import { ltrim } from 'egret/base/common/strings';
import * as pathUtil from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { trim, trimLeft } from '../utils/strings';
import { localize } from 'egret/base/localization/nls';

/**
 * 引擎版本信息
 */
export interface VersionInfo {
	/**
	 * 版本
	 */
	version: string;
	/**
	 * 路径
	 */
	path: string;
}

/**
 * 引擎信息
 */
export class EgretEngineInfo implements VersionInfo {
	/**
	 * 引擎版本
	 */
	public get version(): string {
		return this._version;
	}
	/**
	 * 引擎路径
	 */
	public get path(): string {
		return this._path;
	}

	constructor(private _version: string, private _path: string) {
		this._path = trimLeft(_path);
		this._version = trim(_version);
	}

	/**
     * 得到gui框架属性表文件路径
     */
	public get guiPropertiesPath(): string {
		return pathUtil.join(this.path, 'tools/lib/exml/properties.json');
	}

	/**
     * 得到gui框架清单文件路径
     */
	public get guiManifestPath(): string {
		return pathUtil.join(this.path, 'tools/lib/exml/egret-manifest.xml');
	}

	/**
     * 得到gui框架清单文件路径
     */
	public get guiExmlXsdPath(): string {
		return pathUtil.join(this.path, 'tools/lib/exml/exml.xsd');
	}

	/**
     * 得到eui框架属性表文件路径
     */
	public get euiPropertiesPath(): string {
		return pathUtil.join(this.path, 'tools/lib/eui/properties.json');
	}

	/**
	 * 得到eui框架清单文件路径
	 */
	public get euiManifestPath(): string {
		return pathUtil.join(this.path, 'tools/lib/eui/manifest.xml');

	}

	/**
     * EUI EXML XSD path (falls back to bundled schema when engine file is missing)
     */
	public get euiExmlXsdPath(): string {
		const enginePath = pathUtil.join(this.path, 'tools/lib/eui/exml.xsd');
		if (fs.existsSync(enginePath)) {
			return enginePath;
		}
		return getBundledEuiSchemaPath('exml.xsd');
	}

	/**
	 * EUI manifest with bundled fallback
	 */
	public getResolvedEuiManifestPath(): string {
		const enginePath = this.euiManifestPath;
		if (fs.existsSync(enginePath)) {
			return enginePath;
		}
		return getBundledEuiSchemaPath('manifest.xml');
	}

	/**
	 * EUI properties.json with bundled fallback
	 */
	public getResolvedEuiPropertiesPath(): string {
		const enginePath = this.euiPropertiesPath;
		if (fs.existsSync(enginePath)) {
			return enginePath;
		}
		return getBundledEuiSchemaPath('properties.json');
	}

	/**
     * 得到eui框架清单文件路径
     */
	public get egretLibPath(): string {
		return pathUtil.join(this.path, 'build/egret/egret.js');
	}

	/**
     * 得到eui框架清单文件路径
     */
	public get egretWebLibPath(): string {
		return pathUtil.join(this.path, 'build/egret/egret.web.js');
	}

	/**
     * 得到eui框架清单文件路径
     */
	public get euiLibPath(): string {
		return pathUtil.join(this.path, 'build/eui/eui.js');
	}

	/**
     * 得到tween库
     */
	public get tweenPath(): string {
		return pathUtil.join(this.path, 'build/tween/tween.js');
	}
}

let versionCaches: VersionInfo[] = null;
let versionsPromise: Promise<VersionInfo[]> = null;

function normalizeEnginePath(rawPath: string): string {
	let enginePath = trim(ltrim(rawPath || '')).replace(/\r/g, '');
	enginePath = enginePath.split('\\').join('/');
	if (enginePath && enginePath.charAt(enginePath.length - 1) !== '/') {
		enginePath += '/';
	}
	return enginePath;
}

function parseEgretVersionsOutput(data: string): VersionInfo[] {
	const versionInfos: VersionInfo[] = [];
	if (!data) {
		return versionInfos;
	}
	const lines = data.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const versionStr = trim(lines[i]);
		if (!versionStr) {
			continue;
		}
		// Egret Engine <version> <path...>
		const match = versionStr.match(/^Egret\s+Engine\s+(\S+)\s+(.+)$/i);
		if (match) {
			versionInfos.push({
				version: trim(match[1]),
				path: normalizeEnginePath(match[2])
			});
			continue;
		}
		const tempArr: string[] = versionStr.split(/\s+/);
		if (tempArr.length < 4) {
			continue;
		}
		tempArr.splice(0, 2);
		const version: string = tempArr.shift();
		const versionPath: string = tempArr.join(' ');
		if (version && versionPath) {
			versionInfos.push({ version: trim(version), path: normalizeEnginePath(versionPath) });
		}
	}
	return versionInfos;
}

/**
 * Installed Egret engine versions.
 * @param reload reload cache
 */
export function versions(reload: boolean = false): Promise<VersionInfo[]> {
	if (!reload && versionCaches) {
		return Promise.resolve(versionCaches);
	}
	versionCaches = null;
	if (!versionsPromise) {
		versionsPromise = new Promise<VersionInfo[]>((resolve, reject) => {
			exec('egret versions').then(data => {
				const versionInfos = parseEgretVersionsOutput(data);
				if (versionInfos.length > 0) {
					versionCaches = versionInfos;
					resolve(versionInfos);
				} else {
					reject(localize('egretSDK.versions.envError', 'Failed to get the engine list, try to restore the engine environment variable to ensure that the \'egret versions\' command can be executed normally.'));
					versionsPromise = null;
				}
			}, error => {
				reject(localize('egretSDK.versions.envError', 'Failed to get the engine list, try to restore the engine environment variable to ensure that the \'egret versions\' command can be executed normally.'));
				versionsPromise = null;
			});
		});
	}
	return versionsPromise;
}

let engineInfosCaches: EgretEngineInfo[] = null;
let engineInfosPromise: Promise<EgretEngineInfo[]> = null;
/**
 * 当前引擎的信息列表
 * @param reload 是否重新加载
 */
export function engineInfos(reload: boolean = false): Promise<EgretEngineInfo[]> {
	if (!reload && engineInfosCaches) {
		return Promise.resolve(engineInfosCaches);
	}
	engineInfosCaches = null;
	if (!engineInfosPromise) {
		engineInfosPromise = versions(reload).then(versions => {
			engineInfosCaches = [];
			for (let i = 0; i < versions.length; i++) {
				engineInfosCaches.push(new EgretEngineInfo(versions[i].version, versions[i].path));
			}
			engineInfosPromise = null;
			return engineInfosCaches;
		});
	}
	return engineInfosPromise;
}



/**
 * 通过版本号得到一个引擎信息
 * @param version 版本号
 * @param reload 重新加载默认为false
 */
export function engineInfo(version: string, reload: boolean = false): Promise<EgretEngineInfo> {
	return new Promise<EgretEngineInfo>((resolve, reject) => {
		engineInfos(reload).then(infos => {
			let targetInfo: EgretEngineInfo = null;
			for (let i = 0; i < infos.length; i++) {
				if (infos[i].version == version) {
					targetInfo = infos[i];
				}
			}
			// Prefer exact version, otherwise newest installed engine
			if (!targetInfo && infos.length > 0) {
				targetInfo = infos[infos.length - 1];
				console.warn(`Egret engine ${version} not found, falling back to ${targetInfo.version}`);
			}
			if (targetInfo) {
				resolve(targetInfo);
			} else {
				reject(localize('engineInfo.error', 'Unable to find the {0} version of the Egret engine. Please re-do this after installing or modifying the project engine version.', version));
			}
		}, error => {
			reject(error);
		});
	});
}

function getAppRoot(): string {
	const candidates: string[] = [];
	const push = (p: string) => {
		if (p && candidates.indexOf(p) === -1) {
			candidates.push(p);
		}
	};
	try {
		if (app && typeof app.getAppPath === 'function') {
			push(app.getAppPath());
		}
	} catch (_e) { /* renderer */ }
	try {
		const electronRemote = require('@electron/remote');
		if (electronRemote && electronRemote.app) {
			push(electronRemote.app.getAppPath());
		}
	} catch (_e) { /* ignore */ }
	push(process.cwd());
	// Dev: app path may be out/.../bootstrap — walk up to find resources/egret-sdk/eui
	for (let i = 0; i < candidates.length; i++) {
		let dir = candidates[i];
		for (let depth = 0; depth < 8; depth++) {
			const probe = pathUtil.join(dir, 'resources', 'egret-sdk', 'eui');
			if (fs.existsSync(probe)) {
				return dir;
			}
			const parent = pathUtil.dirname(dir);
			if (!parent || parent === dir) {
				break;
			}
			dir = parent;
		}
	}
	return candidates[0] || process.cwd();
}

/**
 * Bundled EUI schema files shipped with the editor (resources/egret-sdk/eui).
 */
export function getBundledEuiSchemaPath(fileName: string): string {
	return pathUtil.join(getAppRoot(), 'resources', 'egret-sdk', 'eui', fileName);
}
