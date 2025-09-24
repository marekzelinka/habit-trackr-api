import { desc, eq } from "drizzle-orm";
import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import { habits, habitTags, InsertHabitSchema } from "../db/schema.ts";
import { authenticate, getUserIdFromRequest } from "../middleware/auth.ts";

export const habitsRouter = express.Router();

habitsRouter.use(authenticate);

habitsRouter.get("/", async (req, res) => {
	const userId = getUserIdFromRequest(req);

	try {
		// Query user habits with their tags
		const habitsWithTagsData = await db.query.habits.findMany({
			where: eq(habits.userId, userId),
			with: {
				habitTags: {
					with: {
						tag: true,
					},
				},
			},
			orderBy: [desc(habits.createdAt)],
		});

		// Include habit tags directly
		const habitsWithTags = habitsWithTagsData.map((habit) => ({
			...habit,
			tags: habit.habitTags.map((habitTag) => habitTag.tag),
			habitTags: undefined,
		}));

		res.json({
			success: true,
			message: "Habits retrived",
			data: { habits: habitsWithTags },
		});
	} catch (error) {
		console.error("Get habbits error:", error);

		res.status(500).json({ success: false, error: "Failed to fetch habits" });
	}
});

const CreateHabitSchema = InsertHabitSchema.extend({
	name: z.string().min(1, "Habit name is required").max(100, "Name too long"),
	description: z.string().optional(),
	frequency: z.enum(["daily", "weekly", "monthly"], {
		error: "Frequency must be daily, weekly, or monthly",
	}),
	targetCount: z.number().int().positive().optional().default(1),
	tagIds: z.array(z.uuid()).optional(),
}).pick({
	name: true,
	description: true,
	frequency: true,
	targetCount: true,
	tagIds: true,
});

habitsRouter.post(
	"/",
	validate({
		body: CreateHabitSchema,
	}),
	async (req, res) => {
		const userId = getUserIdFromRequest(req);

		const { name, description, frequency, targetCount, tagIds } = req.body;

		try {
			// Start a transaction to create the habit, and create a relation between
			// habit and created habit tags, if tag ids are provided
			const newHabit = await db.transaction(async (tx) => {
				// Create the habit
				const [newHabit] = await tx
					.insert(habits)
					.values({ userId, name, description, frequency, targetCount })
					.returning({ id: habits.id });

				// If tag ids are provided, create the relation
				if (tagIds?.length) {
					await tx.insert(habitTags).values(
						tagIds.map((tagId) => ({
							habitId: newHabit.id,
							tagId,
						})),
					);
				}

				return newHabit;
			});

			res.status(201).json({
				success: true,
				message: "Habit created",
				data: { habit: newHabit },
			});
		} catch (error) {
			console.error("Create habbit error:", error);

			res.status(500).json({ success: false, error: "Failed to create habit" });
		}
	},
);
