import { Main } from '../main';
import { getStartConfig } from 'egret/platform/environment/common/args';


function main() {
	const config = getStartConfig();
	const main = new Main();
	main.startup(config).then(() => {
	}, error => {
		if (error && error.stack) {
			console.log(error.stack);
		} else {
			console.log(error);
		}
	});
}
main();