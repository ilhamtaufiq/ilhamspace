const STORAGE_KEY = "ilhamspace-comment-author";

export type StoredCommentAuthor = {
  name: string;
  email: string;
};

export const loadCommentAuthor = (): StoredCommentAuthor => {
  if (typeof window === "undefined") {
    return { name: "", email: "" };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { name: "", email: "" };
    }

    const parsed = JSON.parse(raw) as Partial<StoredCommentAuthor>;
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
    };
  } catch {
    return { name: "", email: "" };
  }
};

export const saveCommentAuthor = (author: StoredCommentAuthor): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(author));
  } catch {
    // Ignore quota or privacy mode errors.
  }
};