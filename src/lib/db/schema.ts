import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  contentJson: text("content_json").notNull().default("{}"),
  contentHtml: text("content_html").notNull().default(""),
  tags: text("tags"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  noComments: integer("no_comments", { mode: "boolean" })
    .notNull()
    .default(false),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const pages = sqliteTable("pages", {
  slug: text("slug").primaryKey(),
  views: integer("views").notNull().default(0),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  iconUrl: text("icon_url"),
  language: text("language"),
  languageColor: text("language_color"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Project = typeof projects.$inferSelect;