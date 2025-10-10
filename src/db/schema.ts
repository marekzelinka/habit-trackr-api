import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";

export const users = table("users", {
	id: t.uuid().primaryKey().defaultRandom(),
	email: t.varchar({ length: 255 }).notNull().unique(),
	username: t.varchar({ length: 50 }).notNull().unique(),
	password: t.varchar({ length: 255 }).notNull(),
	firstName: t.varchar({ length: 50 }),
	lastName: t.varchar({ length: 50 }),
	createdAt: t.timestamp().defaultNow().notNull(),
	updatedAt: t.timestamp().defaultNow().notNull(),
});

export const habits = table("habits", {
	id: t.uuid().primaryKey().defaultRandom(),
	userId: t
		.uuid()
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	name: t.varchar({ length: 100 }).notNull(),
	description: t.text(),
	frequency: t.varchar({ enum: ["daily", "weekly", "monthly"] }).notNull(),
	targetCount: t.integer().default(1),
	isActive: t.boolean().default(true).notNull(),
	createdAt: t.timestamp().defaultNow().notNull(),
	updatedAt: t.timestamp().defaultNow().notNull(),
});

export const entries = table("entries", {
	id: t.uuid().primaryKey().defaultRandom(),
	habitId: t
		.uuid()
		.references(() => habits.id, { onDelete: "cascade" })
		.notNull(),
	completionDate: t.timestamp().defaultNow().notNull(),
	note: t.text(),
	createdAt: t.timestamp().defaultNow().notNull(),
});

export const tags = table("tags", {
	id: t.uuid().primaryKey().defaultRandom(),
	name: t.varchar({ length: 50 }).notNull().unique(),
	color: t.varchar({ length: 7 }).default("#6B7280"),
	createdAt: t.timestamp().defaultNow().notNull(),
	updatedAt: t.timestamp().defaultNow().notNull(),
});

export const habitTags = table("habit_tags", {
	id: t.uuid().primaryKey().defaultRandom(),
	habitId: t
		.uuid()
		.references(() => habits.id, { onDelete: "cascade" })
		.notNull(),
	tagId: t
		.uuid()
		.references(() => tags.id, { onDelete: "cascade" })
		.notNull(),
	createdAt: t.timestamp().defaultNow().notNull(),
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

export const InsertUserSchema = createInsertSchema(users);
export const SelectUserSchema = createSelectSchema(users);
export const UpdateUserSchema = createUpdateSchema(users);

export const InsertHabitSchema = createInsertSchema(habits);
export const SelectHabitSchema = createSelectSchema(habits);
export const UpdateHabitSchema = createUpdateSchema(habits);

export const InsertEntrySchema = createInsertSchema(entries);
export const SelectEntrySchema = createSelectSchema(entries);
export const UpdateEntrySchema = createUpdateSchema(entries);

export const InsertTagSchema = createInsertSchema(tags);
export const SelectTagSchema = createSelectSchema(tags);
export const UpdateTagSchema = createUpdateSchema(tags);

export const InsertHabitTagSchema = createInsertSchema(habitTags);
export const SelectHabitTagSchema = createSelectSchema(habitTags);
export const UpdateHabitTagSchema = createUpdateSchema(habitTags);

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
