import type { NextFunction, Request, Response } from "express";
import * as z from "zod";

export function validateBody(Schema: z.ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			Schema.parse(req.body);

			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(400).json({
					error: "Validation failed",
					details: error.issues.map((error) => ({
						field: error.path.join("."),
						message: error.message,
					})),
				});

				return;
			}

			next(error);
		}
	};
}

export function validateParams(Schema: z.ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			Schema.parse(req.params);

			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(400).json({
					error: "Invalid parameters",
					details: error.issues.map((error) => ({
						field: error.path.join("."),
						message: error.message,
					})),
				});

				return;
			}

			next(error);
		}
	};
}

export function validateQuery(Schema: z.ZodType) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			Schema.parse(req.query);

			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				res.status(400).json({
					error: "Invalid query parameters",
					details: error.issues.map((error) => ({
						field: error.path.join("."),
						message: error.message,
					})),
				});

				return;
			}

			next(error);
		}
	};
}
