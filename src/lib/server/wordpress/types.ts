export type WordPressImportPost = {
  wpId: string;
  title: string;
  slug: string;
  contentHtml: string;
  description?: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: Date | null;
};

export type WordPressImportMedia = {
  wpId: string;
  url: string;
  title: string;
};

export type WordPressImportComment = {
  wpId: string;
  wpPostId: string;
  wpParentId: string;
  authorName: string;
  authorEmail: string;
  body: string;
  createdAt: Date;
};

export type WordPressExportData = {
  posts: WordPressImportPost[];
  media: WordPressImportMedia[];
  comments: WordPressImportComment[];
};

export type WordPressImportSectionResult = {
  imported: number;
  skipped: number;
  failed: number;
};

export type WordPressImportResult = {
  posts: WordPressImportSectionResult;
  media: WordPressImportSectionResult;
  comments: WordPressImportSectionResult;
  errors: string[];
};

export const emptySectionResult = (): WordPressImportSectionResult => ({
  imported: 0,
  skipped: 0,
  failed: 0,
});