/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {SiObjectOld} from "./SiObjectOld";

export class SiLink<T extends SiObjectOld> {

	private id: string;

	public constructor(id: string) {

		this.id = id;

	}

	public setId(id: string): void {

		this.id = id;

	}

	public async fetch(): Promise<T> {



	}
}