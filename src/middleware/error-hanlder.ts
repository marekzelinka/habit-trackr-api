import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../../env.ts";

export interface CustomError extends Error {
	status?: number;
	code?: string;
}

export const errorHandler: ErrorRequestHandler = (
	err: CustomError,
	_req,
	res,
	_next,
) => {
	console.error(err.stack);

	// Default error
	let status = err.status || 500;
	let message = err.message || "Internal Server Error";

	// Handle specific error types
	if (err.name === "ValidationError") {
		status = 400;
		message = "Validation Error";
	}

	if (err.name === "UnauthorizedError") {
		status = 401;
		message = "Unauthorized";
	}

	res.status(status).json({
		error: message,
		...(env.APP_STAGE === "dev" && {
			stack: err.stack,
			details: err.message,
		}),
	});
};

export const notFound: RequestHandler = (req, _res, next) => {
	const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
	error.status = 404;

	next(error);
};
