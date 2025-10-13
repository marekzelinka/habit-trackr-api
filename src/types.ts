/**
 * @example
 * ```ts
 * app.get("/", (c) => {
 *   return c.json<SuccessResponse<{ id: number }>>(
 *     {
 *       success: true,
 *       message: "Post created",
 *       data: { id: 1 },
 *     },
 *     201
 *   );
 * });
 * ```
 */
export type SuccessResponse<T = void> = {
	success: true;
} & (T extends void ? { message: string } : { message?: string; data: T });

/**
 * @example
 * ```ts
 * app.get("*", (c) => {
 *   return c.json<ErrorResponse>(
 *     {
 *       success: false,
 *       error: "Not Found",
 *     },
 *     404
 *   );
 * });
 * ```
 */
export type ErrorResponse = {
	success: false;
	error: string;
};
