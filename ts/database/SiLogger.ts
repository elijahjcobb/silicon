/**
 *
 * Elijah Cobb
 *
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 *
 */

export class SiLogger {

	private readonly shouldLog: boolean;

	public constructor(shouldLog: boolean = false) {

		this.shouldLog = shouldLog;

	}

	public log(object: object, msg: string): void {

		if (!this.shouldLog) return;

		console.log(msg);
		console.log(object);

	}

}