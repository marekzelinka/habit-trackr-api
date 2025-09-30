import { eq, sql } from "drizzle-orm";
import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import {
	habitTags,
	InsertTagSchema,
	tags,
	UpdateTagSchema,
} from "../db/schema.ts";
import { authenticate } from "../middleware/auth.ts";

export const tagsRouter = express.Router();

tagsRouter.use(authenticate);

tagsRouter.post(
	"/",
	validate({
		body: InsertTagSchema.extend({
			name: z.string().min(1, "Tag name is required").max(50, "Name too long"),
			color: z
				.string()
				.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
				.optional(),
		}).pick({
			name: true,
			color: true,
		}),
	}),
	async (req, res) => {
		const { name, color } = req.body;

		try {
			// Check if tag with same name already exists
			const existingTag = await db.query.tags.findFirst({
				where: eq(tags.name, name),
			});

			if (existingTag) {
				res
					.status(409)
					.json({ success: false, error: "Tag with this name already exists" });

				return;
			}

			const [newTag] = await db
				.insert(tags)
				.values({ name, color })
				.returning();

			res
				.status(201)
				.json({ success: true, message: "Tag created", data: { tag: newTag } });
		} catch (error) {
			console.error("Create tag error:", error);

			res.status(500).json({ success: false, error: "Failed to create tag" });
		}
	},
);

tagsRouter.get("/", async (_req, res) => {
	try {
		const selectResult = await db.select().from(tags).orderBy(tags.name);

		res.json({ success: true, data: { tags: selectResult } });
	} catch (error) {
		console.error("Get tags error:", error);

		res.status(500).json({ success: false, error: "Failed to fetch tags" });
	}
});

tagsRouter.get("/popular", async (_req, res) => {
	try {
		const popularTags = await db
			.select({
				id: tags.id,
				name: tags.name,
				color: tags.color,
				createdAt: tags.createdAt,
				updatedAt: tags.updatedAt,
				usageCount: sql<number>`count(${habitTags.id})`,
			})
			.from(tags)
			.leftJoin(habitTags, eq(habitTags.tagId, tags.id))
			.groupBy(tags.id)
			.orderBy(sql`count(${habitTags.id}) DESC`)
			.limit(10);

		res.json({ success: true, data: { tags: popularTags } });
	} catch (error) {
		console.error("Get popular tags error:", error);

		res
			.status(500)
			.json({ success: false, error: "Failed to fetch popular tags" });
	}
});

tagsRouter.get(
	"/:tagId",
	validate({ params: z.object({ tagId: z.uuid("Invalid habit ID format") }) }),
	async (req, res) => {
		const { tagId } = req.params;

		try {
			const tag = await db.query.tags.findFirst({
				where: eq(tags.id, tagId),
				with: {
					habitTags: {
						with: {
							habit: {
								columns: {
									id: true,
									name: true,
									description: true,
									isActive: true,
								},
							},
						},
					},
				},
			});

			if (!tag) {
				res.status(404).json({ success: false, error: "Tag not found" });

				return;
			}

			const tagWithHabits = {
				...tag,
				habits: tag.habitTags.map((habitTag) => habitTag.habit),
				habitTags: undefined,
			};

			res.json({ success: true, data: { tag: tagWithHabits } });
		} catch (error) {
			console.error("Get tag error:", error);

			res.status(500).json({ success: false, error: "Failed to fetch tag" });
		}
	},
);

tagsRouter.put(
	"/:tagId",
	validate({
		params: z.object({
			tagId: z.uuid("Invalid habit ID format"),
		}),
		body: UpdateTagSchema.extend({
			name: z.string().min(1).max(50).optional(),
			color: z
				.string()
				.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
				.optional(),
		}).pick({
			name: true,
			color: true,
		}),
	}),
	async (req, res) => {
		const { tagId } = req.params;
		const { name, color } = req.body;

		try {
			// If updating name, check if new name already exists
			if (name) {
				const existingTag = await db.query.tags.findFirst({
					where: eq(tags.name, name),
				});

				if (existingTag && existingTag.id !== tagId) {
					res.status(409).json({
						success: false,
						error: "Tag with this name already exists",
					});

					return;
				}
			}

			const [updatedTag] = await db
				.update(tags)
				.set({
					name,
					color,
				})
				.where(eq(tags.id, tagId))
				.returning();

			if (!updatedTag) {
				res.status(409).json({ success: false, error: "Tag not found" });

				return;
			}

			res.json({
				success: true,
				message: "Tag updated",
				data: { tag: updatedTag },
			});
		} catch (error) {
			console.error("Update tag error:", error);

			res.status(500).json({ success: false, error: "Failed to update tag" });
		}
	},
);

tagsRouter.delete(
	"/:tagId",
	validate({
		params: z.object({
			tagId: z.uuid("Invalid habit ID format"),
		}),
	}),
	async (req, res) => {
		const { tagId } = req.params;

		try {
			// Check to see if tag is being used
			const tagUsage = await db
				.select()
				.from(habitTags)
				.where(eq(habitTags.tagId, tagId))
				.limit(1);

			if (tagUsage.length !== 0) {
				res
					.status(409)
					.json({
						success: false,
						error: "Tag is in use, remove this tag from habits before deleting",
					});

				return;
			}

			const [deletedTag] = await db
				.delete(tags)
				.where(eq(tags.id, tagId))
				.returning({ id: tags.id });

			if (!deletedTag) {
				res.status(404).json({ success: false, error: "Tag not found" });

				return;
			}

			res.json({ success: true, message: "Tag deleted" });
		} catch (error) {
			console.error("Delete tag error:", error);

			res.status(500).json({ success: false, error: "Failed to delete tag" });
		}
	},
);
