/**
 * @example
 * ```ts
 * (req, res: express.Response<SuccessResponse<{ id: number }>) {
 *   res.status(201).json({ success: true, message: "OK", data: { id: 1 } });
 * }
 * ```
 */
export type SuccessResponse<T = void> = {
	success: true;
	message: string;
} & (T extends void ? Record<string, never> : { data: T });

/**
 * @example
 * ```ts
 * (req, res: express.Response<ErrorResponse>) {
 *   res.status(400).json({ success: false, error: "Failure" });
 * }
 * ```
 */
export type ErrorResponse = {
	success: false;
	error: string;
};
