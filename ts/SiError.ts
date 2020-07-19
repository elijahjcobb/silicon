/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

export class SiError extends Error {

	public static notImplemented: SiError = new SiError("Method not implemented.");
	public static undefinedId: SiError = new SiError("The object has an undefined id.");

}