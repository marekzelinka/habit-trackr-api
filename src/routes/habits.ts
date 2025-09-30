import { and, desc, eq } from "drizzle-orm";
import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import {
	entries,
	habits,
	habitTags,
	InsertEntrySchema,
	InsertHabitSchema,
} from "../db/schema.ts";
import { authenticate, getUserIdFromRequest } from "../middleware/auth.ts";

export const habitsRouter = express.Router();

habitsRouter.use(authenticate);

const HabitIdSchema = z.object({
	habitId: z.uuid("Invalid habit ID format"),
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
	async function createHabit(req, res) {
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
					.returning();

				// If tag ids are provided, create the relation
				if (tagIds && tagIds.length !== 0) {
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

const UpdateHabitTagsSchema = z.object({
	tagIds: z.array(z.uuid()).min(1, "At least one tag ID is required"),
});

habitsRouter.post(
	"/:habitId/tags",
	validate({ params: HabitIdSchema, body: UpdateHabitTagsSchema }),
	async function addTagsToHabit(req, res) {
		const userId = getUserIdFromRequest(req);

		const { habitId } = req.params;
		const { tagIds } = req.body;

		try {
			// Verify the habit belongs to user
			const [habit] = await db
				.select({ id: habits.id })
				.from(habits)
				.where(and(eq(habits.id, habitId), eq(habits.userId, userId)));

			if (!habit) {
				res.status(404).json({ success: false, error: "Habit not found" });

				return;
			}

			const existingHabitTags = await db
				.select({ tagId: habitTags.tagId })
				.from(habitTags)
				.where(eq(habitTags.habitId, habitId));

			const existingHabitTagIds = existingHabitTags.map(
				(habitTag) => habitTag.tagId,
			);
			// Filter the new tag ids to remove existing ones, so we don't
			// end up with duplicates.
			const newHabitTagIds = tagIds.filter(
				(tagId) => !existingHabitTagIds.includes(tagId),
			);

			if (newHabitTagIds.length !== 0) {
				await db.insert(habitTags).values(
					newHabitTagIds.map((tagId) => ({
						habitId,
						tagId,
					})),
				);
			}

			res.status(201).json({ success: true, message: "Habit tags added" });
		} catch (error) {
			console.error("Add tag ids to habit error:", error);

			res.json({ success: false, error: "Failed to add tag ids to habit" });
		}
	},
);

const CreateHabitCompletionSchema = InsertEntrySchema.pick({ note: true });

habitsRouter.post(
	"/:habitId/complete",
	validate({ params: HabitIdSchema, body: CreateHabitCompletionSchema }),
	async function logHabitCompletion(req, res) {
		const userId = getUserIdFromRequest(req);

		const { habitId } = req.params;
		const { note } = req.body;

		try {
			// Verify habit belongs to current user
			const [habit] = await db
				.select({ isActive: habits.isActive })
				.from(habits)
				.where(and(eq(habits.id, habitId), eq(habits.userId, userId)));

			if (!habit) {
				res.status(404).json({ success: false, error: "Habit not found" });

				return;
			} else if (!habit.isActive) {
				res
					.status(400)
					.json({
						success: false,
						error: "Cannot complete an invactive habit",
					});

				return;
			}

			// Create a new completion entry
			const [newEntry] = await db
				.insert(entries)
				.values({ habitId, completion_date: new Date(), note })
				.returning({
					id: entries.id,
					completion_date: entries.completion_date,
					note: entries.note,
					createdAt: entries.createdAt,
				});

			res.status(201).json({
				success: true,
				message: "Habit completed successfully",
				data: { entry: newEntry },
			});
		} catch (error) {
			console.error("Complete habbit error:", error);

			res
				.status(500)
				.json({ success: false, error: "Failed to complete habit" });
		}
	},
);

habitsRouter.get("/", async function getAllHabits(req, res) {
	const userId = getUserIdFromRequest(req);

	try {
		// Query user habits with their tags
		const queryResult = await db.query.habits.findMany({
			where: eq(habits.userId, userId),
			with: {
				habitTags: {
					columns: {},
					with: {
						tag: true,
					},
				},
			},
			orderBy: [desc(habits.createdAt)],
		});

		// Include habit tags directly
		const habitsWithTags = queryResult.map((habit) => ({
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
