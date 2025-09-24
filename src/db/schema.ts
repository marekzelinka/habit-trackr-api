import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from "drizzle-zod";

export const users = table("users", {
	id: t.uuid("id").primaryKey().defaultRandom(),
	email: t.varchar("email", { length: 255 }).notNull().unique(),
	username: t.varchar("username", { length: 50 }).notNull().unique(),
	// TODO: move password to its own table
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
	// TODO: rename to completionDate
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
