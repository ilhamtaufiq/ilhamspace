export type PostStats = {
  views: number;
  comments: number;
};

/** Placeholder until view/comment APIs are wired up. */
export const getPlaceholderPostStats = (_slug: string): PostStats => ({
  views: 0,
  comments: 0,
});

export const formatStatCount = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};