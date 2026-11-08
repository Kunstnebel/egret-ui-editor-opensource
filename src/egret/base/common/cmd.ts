import childProcess = require('child_process');

/**
 * Execute a shell command.
 * Prefer stdout when present — many CLIs write warnings to stderr without failing.
 */
export function exec(command: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		childProcess.exec(command, { windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
			const out = (stdout || '').toString();
			const err = (stderr || '').toString();
			if (out && out.trim().length > 0) {
				resolve(out);
				return;
			}
			if (error) {
				reject(error);
				return;
			}
			if (err && err.trim().length > 0) {
				reject(err);
				return;
			}
			resolve(out);
		});
	});
}
