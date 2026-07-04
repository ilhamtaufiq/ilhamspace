export type CommentAvatar = {
  emoji: string;
  background: string;
};

const PIXEL_EMOJIS = [
  "👾",
  "🕹️",
  "👽",
  "🤖",
  "💾",
  "📟",
  "🎮",
  "🚀",
  "⭐",
  "🔥",
  "💎",
  "🌙",
  "☄️",
  "🛸",
  "🎯",
  "🧩",
  "🦾",
  "🐸",
  "🦊",
  "🐱",
  "🐶",
  "🎲",
  "♟️",
  "🎪",
  "🌵",
  "🍄",
  "🦴",
  "👻",
  "🎃",
  "🌈",
] as const;

const RETRO_BACKGROUNDS = [
  "#ffd93d",
  "#3dd9eb",
  "#ff6b9d",
  "#c4baa8",
  "#39ff14",
  "#ffb000",
  "#e8e0d0",
  "#6b5f7a",
] as const;

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getCommentAvatar = (email: string): CommentAvatar => {
  const normalized = email.trim().toLowerCase();
  const hash = hashString(normalized);

  return {
    emoji: PIXEL_EMOJIS[hash % PIXEL_EMOJIS.length],
    background: RETRO_BACKGROUNDS[hash % RETRO_BACKGROUNDS.length],
  };
};