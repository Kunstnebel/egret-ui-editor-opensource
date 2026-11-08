import * as path from 'path';
import URI from 'egret/base/common/uri';

/**
 * Resolve an exmlRoot URI (often a relative path stored via URI.file) to an absolute filesystem path.
 */
export function resolveExmlRootAbsolutePath(workspaceRoot: string, exmlRoot: URI | string): string {
	let rel = typeof exmlRoot === 'string' ? exmlRoot : (exmlRoot.fsPath || '');
	rel = rel.replace(/\\/g, '/');
	// URI.file('resource/foo') becomes '/resource/foo' or '\resource\foo' on Windows
	if (/^[a-zA-Z]:/.test(rel)) {
		return path.normalize(rel);
	}
	rel = rel.replace(/^\/+/, '');
	return path.normalize(path.join(workspaceRoot, rel));
}

/**
 * Relative display name for an exml root (e.g. eui_skins, skins).
 */
export function getExmlRootDisplayName(workspaceRoot: string, exmlRoot: URI | string): string {
	const abs = resolveExmlRootAbsolutePath(workspaceRoot, exmlRoot);
	return path.basename(abs);
}
