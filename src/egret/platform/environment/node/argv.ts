
import minimist = require('minimist');
import { ParsedArgs } from '../common/args';

const options: minimist.Opts = {
	string: [
		'locale',
		'user-data-dir',
	],
	boolean: [
	],
	alias: {
	}
};
/**
 * Parse command line arguments, e.g. `--verbose --wait`
 */
export function parseArgs(args: string[]): ParsedArgs {
	return minimist(args, options) as ParsedArgs;
}
