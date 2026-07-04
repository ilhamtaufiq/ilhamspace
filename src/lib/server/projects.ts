import { randomUUID } from "node:crypto";

import { asc, desc, eq } from "drizzle-orm";

import { db } from "$lib/db/index";
import { type Project, projects } from "$lib/db/schema";

export type ProjectInput = {
  title: string;
  description?: string;
  url: string;
  iconUrl?: string;
  language?: string;
  languageColor?: string;
  sortOrder: number;
  status: "draft" | "published";
};

const normalizeOptional = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const getAllProjects = async (): Promise<Project[]> => {
  try {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.sortOrder), desc(projects.updatedAt));
  } catch (error) {
    console.error("[server/projects] list error:", error);
    return [];
  }
};

export const getPublishedProjects = async (): Promise<Project[]> => {
  try {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(desc(projects.sortOrder), asc(projects.title));
  } catch (error) {
    console.error("[server/projects] published list error:", error);
    return [];
  }
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/projects] get by id error:", error);
    return null;
  }
};

export const createProject = async (
  input: ProjectInput,
): Promise<Project | null> => {
  try {
    const now = new Date();
    const rows = await db
      .insert(projects)
      .values({
        id: randomUUID(),
        title: input.title,
        description: normalizeOptional(input.description),
        url: input.url,
        iconUrl: normalizeOptional(input.iconUrl),
        language: normalizeOptional(input.language),
        languageColor: normalizeOptional(input.languageColor),
        sortOrder: input.sortOrder,
        status: input.status,
        publishedAt: input.status === "published" ? now : null,
        updatedAt: now,
      })
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/projects] create error:", error);
    return null;
  }
};

export const updateProject = async (
  id: string,
  input: ProjectInput,
): Promise<Project | null> => {
  try {
    const existing = await getProjectById(id);
    if (!existing) {
      return null;
    }

    const now = new Date();
    const publishedAt =
      input.status === "published"
        ? (existing.publishedAt ?? now)
        : null;

    const rows = await db
      .update(projects)
      .set({
        title: input.title,
        description: normalizeOptional(input.description),
        url: input.url,
        iconUrl: normalizeOptional(input.iconUrl),
        language: normalizeOptional(input.language),
        languageColor: normalizeOptional(input.languageColor),
        sortOrder: input.sortOrder,
        status: input.status,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(projects.id, id))
      .returning();

    return rows[0] ?? null;
  } catch (error) {
    console.error("[server/projects] update error:", error);
    return null;
  }
};

export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  } catch (error) {
    console.error("[server/projects] delete error:", error);
    return false;
  }
};