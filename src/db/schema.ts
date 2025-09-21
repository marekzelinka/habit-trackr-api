import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = table("users", {
	id: t.uuid("id").primaryKey().defaultRandom(),
	email: t.varchar("email", { length: 255 }).notNull().unique(),
	username: t.varchar("username", { length: 50 }).notNull().unique(),
	password: t.varchar("password", { length: 255 }).notNull(),
	firstName: t.varchar("first_name", { length: 50 }),
	lastName: t.varchar("last_name", { length: 50 }),
	createdAt: t.timestamp("created_at").defaultNow().notNull(),
	updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
});

export const habits = table("habits", {
	id: t.uuid("id").primaryKey().defaultRandom(),
	userId: t
		.uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: t.varchar("name", { length: 100 }).notNull(),
	description: t.text("description"),
	frequency: t.varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly
	targetCount: t.integer("target_count").default(1), // how many times per frequency period
	isActive: t.boolean("is_active").default(true).notNull(),
	createdAt: t.timestamp("created_at").defaultNow().notNull(),
	updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
});

export const entries = table("entries", {
	id: t.uuid("id").primaryKey().defaultRandom(),
	habitId: t
		.uuid("habit_id")
		.references(() => habits.id, { onDelete: "cascade" })
		.notNull(),
	completion_date: t.timestamp("completion_date").defaultNow().notNull(),
	note: t.text("note"),
	createdAt: t.timestamp("created_at").defaultNow().notNull(),
});

export const tags = table("tags", {
	id: t.uuid("id").primaryKey().defaultRandom(),
	name: t.varchar("name", { length: 50 }).notNull().unique(),
	color: t.varchar("color", { length: 7 }).default("#6B7280"), // hex color
	createdAt: t.timestamp("created_at").defaultNow().notNull(),
	updatedAt: t.timestamp("updated_at").defaultNow().notNull(),
});

export const habitTags = table("habit_tags", {
	id: t.uuid("id").primaryKey().defaultRandom(),
	habitId: t
		.uuid("habit_id")
		.references(() => habits.id, { onDelete: "cascade" })
		.notNull(),
	tagId: t
		.uuid("tag_id")
		.references(() => tags.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: t.timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	habits: many(habits),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
	user: one(users, {
		fields: [habits.userId],
		references: [users.id],
	}),
	entries: many(entries),
	habitTags: many(habitTags),
}));

export const entriesRelations = relations(entries, ({ one }) => ({
	habit: one(habits, {
		fields: [entries.habitId],
		references: [habits.id],
	}),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	habitTags: many(habitTags),
}));

export const habitTagsRelations = relations(habitTags, ({ one }) => ({
	habit: one(habits, {
		fields: [habitTags.habitId],
		references: [habits.id],
	}),
	tag: one(tags, {
		fields: [habitTags.tagId],
		references: [tags.id],
	}),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertHabitSchema = createInsertSchema(habits);
export const selectHabitSchema = createSelectSchema(habits);

export const insertEntrySchema = createInsertSchema(entries);
export const selectEntrySchema = createSelectSchema(entries);

export const insertTagSchema = createInsertSchema(tags);
export const selectTagSchema = createSelectSchema(tags);

export const insertHabitTagSchema = createInsertSchema(habitTags);
export const selectHabitTagSchema = createSelectSchema(habitTags);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type HabitTag = typeof habitTags.$inferSelect;
export type NewHabitTag = typeof habitTags.$inferInsert;
