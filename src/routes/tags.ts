import { eq } from "drizzle-orm";
import express from "express";
import validate from "express-zod-safe";
import z from "zod";
import { db } from "../db/connection.ts";
import { InsertTagSchema, tags } from "../db/schema.ts";
import { authenticate } from "../middleware/auth.ts";

export const tagsRouter = express.Router();

tagsRouter.use(authenticate);

const CreateTagSchema = InsertTagSchema.extend({
	name: z.string().min(1, "Tag name is required").max(50, "Name too long"),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color")
		.optional(),
}).pick({
	name: true,
	color: true,
});

tagsRouter.post("/", validate({ body: CreateTagSchema }), async (req, res) => {
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

		const [newTag] = await db.insert(tags).values({ name, color }).returning();

		res
			.status(201)
			.json({ success: true, message: "Tag created", data: { tag: newTag } });
	} catch (error) {
		console.error("Create tag error:", error);
		res.status(500).json({ success: false, error: "Failed to create tag" });
	}
});

tagsRouter.get("/", async (_req, res) => {
	try {
		const selectResult = await db.select().from(tags).orderBy(tags.name);

		res.json({ success: true, data: { tags: selectResult } });
	} catch (error) {
		console.error("Get tags error:", error);

		res.status(500).json({ success: false, error: "Failed to fetch tags" });
	}
});
