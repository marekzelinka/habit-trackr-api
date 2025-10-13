import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { isProdEnv } from "../../env.ts";
import type { ErrorResponse } from "../types.ts";

export const notFoundHandler: NotFoundHandler = (c) => {
	return c.json<ErrorResponse>(
		{
			success: false,
			error: "Not Found",
		},
		404,
	);
};

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) {
		const errResponse =
			err.res ??
			c.json<ErrorResponse>(
				{
					success: false,
					error: err.message,
				},
				err.status,
			);

		return errResponse;
	}

	return c.json<ErrorResponse>(
		{
			success: false,
			error: isProdEnv() ? "Internal Server Error" : (err.stack ?? err.message),
		},
		500,
	);
};
