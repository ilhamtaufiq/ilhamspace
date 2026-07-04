import { readFileSync } from "node:fs";
import { join } from "node:path";

import opentype, { type Font } from "opentype.js";
import sharp from "sharp";

import { siteConfig } from "$lib/config/site";
import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
import type {
  MatchDetailView,
  MatchEventView,
  MatchPlayerRating,
  MatchStatsView,
} from "$lib/fotmob/types";

import type { MatchOgCardInput } from "$lib/server/og/match-score-card";

export type MatchStoryStatLine = {
  label: string;
  home: string;
  away: string;
  showBar?: boolean;
  homeNum?: number;
  awayNum?: number;
};

export type MatchStoryPlayerLine = {
  name: string;
  rating: number;
  teamName: string;
  goals: number;
  assists: number;
};

export type MatchStoryGoalLine = {
  minute: number;
  playerName: string;
  assist?: string;
  team: "home" | "away";
};

export type MatchStoryCardInput = MatchOgCardInput & {
  roundLabel: string;
  kickoffLabel: string;
  domain: string;
  insight?: string;
  statLines: MatchStoryStatLine[];
  goalScorers: MatchStoryGoalLine[];
  topPlayers: MatchStoryPlayerLine[];
};

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

/** SNES cartridge menu — light, saturated, pixel retro (DESIGN.md) */
const COLORS = {
  background: "#E8E0D0",
  panel: "#FFF8E8",
  panelAlt: "#F5EDD8",
  panelMuted: "#C4BAA8",
  grid: "#D4CBB8",
  frame: "#2D1B4E",
  frameDim: "#6B5F7A",
  accent: "#FFD93D",
  cyan: "#3DD9EB",
  magenta: "#FF6B9D",
  plum: "#1A0F2E",
  ink: "#2D1B4E",
  score: "#1A0F2E",
  team: "#2D1B4E",
  fifa: "#6B5F7A",
  live: "#FF6B9D",
  status: "#6B5F7A",
  meta: "#6B5F7A",
  brand: "#2D1B4E",
  statLabel: "#6B5F7A",
  statValue: "#1A0F2E",
  statRowAlt: "#EDE5D4",
  statBarBg: "#C4BAA8",
  statBarHome: "#FFD93D",
  statBarAway: "#3DD9EB",
  domain: "#2D1B4E",
  domainAccent: "#3DD9EB",
  logoFallback: "#C4BAA8",
  logoBorder: "#2D1B4E",
  logoRing: "#3DD9EB",
} as const;

const STAT_NEEDLES: Array<{ keys: string[]; label: string }> = [
  { keys: ["ballpossesion", "possession"], label: "POS" },
  { keys: ["expected_goals"], label: "xG" },
  { keys: ["total_shots"], label: "SHOTS" },
  { keys: ["shotsontarget"], label: "SOT" },
  { keys: ["corners"], label: "CORNER" },
  { keys: ["big_chance"], label: "BIG CH" },
];

let cachedFont: Font | null = null;

const loadPixelFont = (): Font => {
  if (cachedFont) {
    return cachedFont;
  }

  const candidates = [
    join(
      process.cwd(),
      "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff",
    ),
    join(
      process.cwd(),
      "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2",
    ),
  ];

  for (const fontPath of candidates) {
    try {
      cachedFont = opentype.parse(readFileSync(fontPath));
      return cachedFont;
    } catch {
      continue;
    }
  }

  throw new Error("Press Start 2P font not found for story image rendering");
};

const truncateName = (name: string, max = 12): string => {
  const upper = name.trim().toUpperCase();
  if (upper.length <= max) {
    return upper;
  }
  return `${upper.slice(0, max - 1)}…`;
};

const truncateInsight = (text: string, max = 48): string => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 1)}…`;
};

const textWidth = (font: Font, text: string, size: number): number =>
  font.getAdvanceWidth(text, size);

const textPath = (
  font: Font,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  anchor: "start" | "middle" | "end" = "start",
): string => {
  const width = textWidth(font, text, size);
  const resolvedX =
    anchor === "middle"
      ? x - width / 2
      : anchor === "end"
        ? x - width
        : x;
  const path = font.getPath(text, resolvedX, y, size);
  return `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
};

type OpentypeBBox = { x1: number; y1: number; x2: number; y2: number };

const pathBoundingBox = (
  font: Font,
  text: string,
  x: number,
  y: number,
  size: number,
): OpentypeBBox => {
  const path = font.getPath(text, x, y, size) as unknown as {
    getBoundingBox: () => OpentypeBBox;
  };
  return path.getBoundingBox();
};

/** Center using glyph bounding box — more accurate than advance width for pixel fonts. */
const textPathCentered = (
  font: Font,
  text: string,
  centerX: number,
  baselineY: number,
  size: number,
  fill: string,
): string => {
  const bbox = pathBoundingBox(font, text, 0, baselineY, size);
  const glyphW = bbox.x2 - bbox.x1;
  const offsetX = centerX - glyphW / 2 - bbox.x1;
  const path = font.getPath(text, offsetX, baselineY, size);
  return `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
};

const baselineInBox = (
  font: Font,
  text: string,
  size: number,
  boxY: number,
  boxH: number,
): number => {
  const bbox = pathBoundingBox(font, text, 0, 0, size);
  const textH = bbox.y2 - bbox.y1;
  const top = boxY + (boxH - textH) / 2;
  return top - bbox.y1;
};

const formatStatValue = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length <= 6) {
    return trimmed;
  }
  return `${trimmed.slice(0, 5)}…`;
};

const formatAssistName = (assist?: string): string | null => {
  if (!assist?.trim()) {
    return null;
  }
  const cleaned = assist
    .replace(/^assist(?:ed)?(?:\s+by)?[:\s]*/i, "")
    .trim();
  if (!cleaned) {
    return null;
  }
  return truncateName(cleaned, 14);
};

const formatGoalMinute = (minute: number): string => `${minute}'`;

const splitGoalsByTeam = (
  goals: MatchStoryGoalLine[],
): { home: MatchStoryGoalLine[]; away: MatchStoryGoalLine[] } => ({
  home: goals.filter((goal) => goal.team === "home"),
  away: goals.filter((goal) => goal.team === "away"),
});

const countGoalRows = (goals: MatchStoryGoalLine[]): number => {
  const { home, away } = splitGoalsByTeam(goals);
  return Math.max(home.length, away.length);
};

const fetchImageBuffer = async (url: string): Promise<Buffer | null> => {
  try {
    const response = await fetch(url, {
      headers: { Accept: "image/*" },
    });
    if (!response.ok) {
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
};

const bufferToDataUrl = (buffer: Buffer, mime: string): string =>
  `data:${mime};base64,${buffer.toString("base64")}`;

const pixelCorners = (
  x: number,
  y: number,
  w: number,
  h: number,
  colors: [string, string, string, string] = [
    COLORS.cyan,
    COLORS.magenta,
    COLORS.accent,
    COLORS.cyan,
  ],
): string => {
  const size = 12;
  const corners: Array<[number, number, string]> = [
    [x, y, colors[0]],
    [x + w - size, y, colors[1]],
    [x, y + h - size, colors[2]],
    [x + w - size, y + h - size, colors[3]],
  ];
  return corners
    .map(
      ([cx, cy, fill]) =>
        `<rect x="${cx}" y="${cy}" width="${size}" height="${size}" fill="${fill}" stroke="${COLORS.frame}" stroke-width="2"/>`,
    )
    .join("\n  ");
};

const panelBox = (
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  font: Font,
  headerFill: string,
): string => {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${COLORS.panel}" stroke="${COLORS.frame}" stroke-width="4"/>
  <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="36" fill="${headerFill}" stroke="${COLORS.frame}" stroke-width="3"/>
  ${textPath(font, title, x + w / 2, y + 34, 11, COLORS.plum, "middle")}
  ${pixelCorners(x, y, w, h)}`;
};

const statBarMarkup = (
  x: number,
  y: number,
  width: number,
  homeNum: number,
  awayNum: number,
): string => {
  const total = homeNum + awayNum;
  const homeWidth =
    total > 0 ? Math.max(4, Math.round((homeNum / total) * width)) : width / 2;
  const awayWidth = Math.max(4, width - homeWidth);
  return `
  <rect x="${x}" y="${y}" width="${width}" height="14" fill="${COLORS.statBarBg}" stroke="${COLORS.frameDim}" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${homeWidth}" height="14" fill="${COLORS.statBarHome}"/>
  <rect x="${x + homeWidth}" y="${y}" width="${awayWidth}" height="14" fill="${COLORS.statBarAway}"/>`;
};

const buildStatRows = (
  font: Font,
  lines: MatchStoryStatLine[],
  panelX: number,
  panelW: number,
  startY: number,
): string => {
  const rowHeight = 54;
  const innerPad = 24;
  const barWidth = 380;
  const barX = panelX + 360;
  const homeValueX = barX - 12;
  const awayValueX = barX + barWidth + 12;

  return lines
    .map((line, index) => {
      const y = startY + index * rowHeight;
      const rowBg =
        index % 2 === 0
          ? ""
          : `<rect x="${panelX + innerPad}" y="${y - 4}" width="${panelW - innerPad * 2}" height="${rowHeight - 4}" fill="${COLORS.statRowAlt}" stroke="${COLORS.frameDim}" stroke-width="1" opacity="0.55"/>`;
      const parts = [
        rowBg,
        textPath(
          font,
          line.label,
          panelX + innerPad,
          y + 22,
          10,
          COLORS.statLabel,
        ),
        textPath(
          font,
          formatStatValue(line.home),
          homeValueX,
          y + 22,
          10,
          COLORS.statValue,
          "end",
        ),
        textPath(
          font,
          formatStatValue(line.away),
          awayValueX,
          y + 22,
          10,
          COLORS.statValue,
          "start",
        ),
      ];

      if (line.showBar) {
        parts.push(
          statBarMarkup(
            barX,
            y + 8,
            barWidth,
            line.homeNum ?? 0,
            line.awayNum ?? 0,
          ),
        );
      } else {
        parts.push(
          `<line x1="${barX}" y1="${y + 16}" x2="${barX + barWidth}" y2="${y + 16}" stroke="${COLORS.frameDim}" stroke-width="2" stroke-dasharray="8 8"/>`,
        );
      }

      return parts.join("\n  ");
    })
    .join("\n  ");
};

const buildGoalRows = (
  font: Font,
  goals: MatchStoryGoalLine[],
  panelX: number,
  panelW: number,
  startY: number,
): string => {
  const { home, away } = splitGoalsByTeam(goals);
  const maxRows = Math.max(home.length, away.length);
  const innerPad = 24;
  const homeX = panelX + innerPad;
  const awayX = panelX + panelW - innerPad;
  const rowHeight = 52;

  return Array.from({ length: maxRows }, (_, index) => {
    const y = startY + index * rowHeight;
    const rowBg =
      index % 2 === 1
        ? `<rect x="${panelX + innerPad}" y="${y - 4}" width="${panelW - innerPad * 2}" height="${rowHeight - 4}" fill="${COLORS.statRowAlt}" stroke="${COLORS.frameDim}" stroke-width="1" opacity="0.55"/>`
        : "";
    const parts = [rowBg];
    const homeGoal = home[index];
    const awayGoal = away[index];

    if (homeGoal) {
      parts.push(
        textPath(
          font,
          `${formatGoalMinute(homeGoal.minute)} ${truncateName(homeGoal.playerName, 11)}`,
          homeX,
          y + 18,
          8,
          COLORS.statValue,
        ),
      );
      const homeAssist = formatAssistName(homeGoal.assist);
      if (homeAssist) {
        parts.push(
          textPath(
            font,
            `A: ${homeAssist}`,
            homeX,
            y + 34,
            7,
            COLORS.statLabel,
          ),
        );
      }
    }

    if (awayGoal) {
      parts.push(
        textPath(
          font,
          `${formatGoalMinute(awayGoal.minute)} ${truncateName(awayGoal.playerName, 11)}`,
          awayX,
          y + 18,
          8,
          COLORS.statValue,
          "end",
        ),
      );
      const awayAssist = formatAssistName(awayGoal.assist);
      if (awayAssist) {
        parts.push(
          textPath(
            font,
            `A: ${awayAssist}`,
            awayX,
            y + 34,
            7,
            COLORS.statLabel,
            "end",
          ),
        );
      }
    }

    return parts.join("\n  ");
  }).join("\n  ");
};

const buildPlayerRows = (
  font: Font,
  players: MatchStoryPlayerLine[],
  panelX: number,
  startY: number,
): string => {
  return players
    .map((player, index) => {
      const y = startY + index * 44;
      const extras: string[] = [];
      if (player.goals > 0) {
        extras.push(`G${player.goals}`);
      }
      if (player.assists > 0) {
        extras.push(`A${player.assists}`);
      }
      const extraText = extras.length > 0 ? ` ${extras.join(" ")}` : "";
      const line = `${truncateName(player.name, 14)} ${player.rating.toFixed(1)}${extraText}`;
      const rowBg =
        index % 2 === 0
          ? ""
          : `<rect x="${panelX + 12}" y="${y - 6}" width="912" height="38" fill="${COLORS.statRowAlt}" opacity="0.55"/>`;
      return `${rowBg}
  ${textPath(font, line, panelX + 28, y + 20, 9, COLORS.statValue)}`;
    })
    .join("\n  ");
};

const buildSvg = (
  input: MatchStoryCardInput,
  homeLogo: string | null,
  awayLogo: string | null,
): string => {
  const font = loadPixelFont();
  const cx = STORY_WIDTH / 2;

  const homeName = truncateName(input.homeName, 11);
  const awayName = truncateName(input.awayName, 11);
  const score = `${input.homeScore} - ${input.awayScore}`;
  const timeLabel = input.timeLabel.trim().toUpperCase();
  const statusLabel = input.statusLabel.trim() || "—";
  const roundLabel = truncateName(input.roundLabel, 20);
  const kickoff = input.kickoffLabel.trim();
  const insight = input.insight ? truncateInsight(input.insight) : "";
  const domain = input.domain.toLowerCase();
  const brand = siteConfig.name.toLowerCase();

  const homeFifa = input.homeFifaRank ? `#${input.homeFifaRank}` : "";
  const awayFifa = input.awayFifaRank ? `#${input.awayFifaRank}` : "";

  const timeColor = input.isLive ? COLORS.live : COLORS.ink;
  const logoSize = 128;
  const homeLogoX = 108;
  const awayLogoX = 844;
  const logoY = 248;
  const homeLogoCx = homeLogoX + logoSize / 2;
  const awayLogoCx = awayLogoX + logoSize / 2;
  const logoCy = logoY + logoSize / 2;
  const logoRadius = logoSize / 2;

  const homeLogoMarkup = homeLogo
    ? `<circle cx="${homeLogoCx}" cy="${logoCy}" r="${logoRadius + 6}" fill="none" stroke="${COLORS.cyan}" stroke-width="4"/>
  <image href="${homeLogo}" x="${homeLogoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#home-logo-clip)"/>`
    : `<circle cx="${homeLogoCx}" cy="${logoCy}" r="${logoRadius}" fill="${COLORS.logoFallback}" stroke="${COLORS.logoBorder}" stroke-width="4"/>`;

  const awayLogoMarkup = awayLogo
    ? `<circle cx="${awayLogoCx}" cy="${logoCy}" r="${logoRadius + 6}" fill="none" stroke="${COLORS.magenta}" stroke-width="4"/>
  <image href="${awayLogo}" x="${awayLogoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#away-logo-clip)"/>`
    : `<circle cx="${awayLogoCx}" cy="${logoCy}" r="${logoRadius}" fill="${COLORS.logoFallback}" stroke="${COLORS.logoBorder}" stroke-width="4"/>`;

  const contentX = 72;
  const contentW = 936;
  const headerCx = contentX + contentW / 2;

  const goalRowCount = countGoalRows(input.goalScorers);
  const goalsPanelY = 532;
  const goalsPanelH =
    goalRowCount > 0 ? 56 + goalRowCount * 52 + 16 : 0;
  const statsPanelY =
    goalRowCount > 0 ? goalsPanelY + goalsPanelH + 24 : 560;
  const statsPanelH = 56 + input.statLines.length * 54 + 24;
  const playersPanelY = statsPanelY + statsPanelH + 28;
  const playersPanelH = 56 + Math.max(input.topPlayers.length, 1) * 44 + 16;

  const liveBadge = input.isLive
    ? `<rect x="${headerCx - 100}" y="462" width="200" height="34" fill="${COLORS.magenta}" stroke="${COLORS.frame}" stroke-width="3"/>
  ${textPathCentered(font, "LIVE", headerCx, 486, 12, "#FFFFFF")}`
    : "";

  const goalsPanel =
    goalRowCount > 0
      ? `${panelBox(contentX, goalsPanelY, contentW, goalsPanelH, "GOALS", font, COLORS.accent)}
  ${buildGoalRows(font, input.goalScorers, contentX, contentW, goalsPanelY + 52)}`
      : "";

  const statPanel =
    input.statLines.length > 0
      ? `${panelBox(contentX, statsPanelY, contentW, statsPanelH, "MATCH STATS", font, COLORS.cyan)}
  ${buildStatRows(font, input.statLines, contentX, contentW, statsPanelY + 52)}`
      : "";

  const playerPanel =
    input.topPlayers.length > 0
      ? `${panelBox(72, playersPanelY, 936, playersPanelH, "TOP PLAYERS", font, COLORS.magenta)}
  ${buildPlayerRows(font, input.topPlayers, 72, playersPanelY + 52)}`
      : "";

  const headerY = 100;
  const headerH = 58;
  const fifaSize = 11;
  const fifaBaseline = baselineInBox(
    font,
    "FIFA WORLD CUP",
    fifaSize,
    headerY,
    headerH,
  );

  const domainPillW = Math.min(520, Math.max(320, textWidth(font, domain, 11) + 48));
  const domainPillX = cx - domainPillW / 2;

  const textPaths = [
    textPathCentered(
      font,
      "FIFA WORLD CUP",
      headerCx,
      fifaBaseline,
      fifaSize,
      COLORS.plum,
    ),
    textPathCentered(font, roundLabel, headerCx, headerY + headerH + 30, 11, COLORS.ink),
    timeLabel
      ? textPathCentered(font, timeLabel, headerCx, headerY + headerH + 62, 18, timeColor)
      : "",
    textPath(font, homeName, homeLogoCx, 404, 12, COLORS.team, "middle"),
    homeFifa
      ? textPath(font, homeFifa, homeLogoCx, 428, 9, COLORS.fifa, "middle")
      : "",
    textPathCentered(font, score, headerCx, 340, 56, COLORS.score),
    textPath(font, awayName, awayLogoCx, 404, 12, COLORS.team, "middle"),
    awayFifa
      ? textPath(font, awayFifa, awayLogoCx, 428, 9, COLORS.fifa, "middle")
      : "",
    textPathCentered(font, statusLabel, headerCx, 438, 11, COLORS.status),
    kickoff
      ? textPathCentered(font, kickoff, headerCx, 514, 9, COLORS.meta)
      : "",
    insight
      ? textPathCentered(font, `> ${insight}`, headerCx, 1680, 10, COLORS.ink)
      : "",
    textPathCentered(font, brand, headerCx, 1796, 10, COLORS.meta),
    `<rect x="${domainPillX}" y="1834" width="${domainPillW}" height="44" fill="${COLORS.frame}" stroke="${COLORS.plum}" stroke-width="3"/>`,
    textPathCentered(font, domain, headerCx, 1864, 11, COLORS.panel),
  ].join("\n  ");

  const topStripe = `
  <rect x="40" y="64" width="333" height="12" fill="${COLORS.accent}" stroke="${COLORS.frame}" stroke-width="2"/>
  <rect x="373" y="64" width="334" height="12" fill="${COLORS.cyan}" stroke="${COLORS.frame}" stroke-width="2"/>
  <rect x="707" y="64" width="333" height="12" fill="${COLORS.magenta}" stroke="${COLORS.frame}" stroke-width="2"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_WIDTH}" height="${STORY_HEIGHT}" viewBox="0 0 ${STORY_WIDTH} ${STORY_HEIGHT}">
  <defs>
    <pattern id="pixel-grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <rect width="24" height="24" fill="${COLORS.background}"/>
      <rect x="0" y="23" width="24" height="1" fill="${COLORS.grid}"/>
      <rect x="23" y="0" width="1" height="24" fill="${COLORS.grid}"/>
    </pattern>
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="${COLORS.ink}" opacity="0.05"/>
    </pattern>
    <clipPath id="home-logo-clip">
      <circle cx="${homeLogoCx}" cy="${logoCy}" r="${logoRadius}"/>
    </clipPath>
    <clipPath id="away-logo-clip">
      <circle cx="${awayLogoCx}" cy="${logoCy}" r="${logoRadius}"/>
    </clipPath>
  </defs>
  <rect width="100%" height="100%" fill="url(#pixel-grid)"/>
  ${topStripe}
  <rect x="40" y="76" width="${STORY_WIDTH - 80}" height="${STORY_HEIGHT - 140}" fill="${COLORS.panelAlt}" stroke="${COLORS.frame}" stroke-width="8"/>
  <rect x="56" y="92" width="${STORY_WIDTH - 112}" height="${STORY_HEIGHT - 172}" fill="none" stroke="${COLORS.frameDim}" stroke-width="2"/>
  ${pixelCorners(40, 76, STORY_WIDTH - 80, STORY_HEIGHT - 140)}
  <rect x="72" y="100" width="936" height="58" fill="${COLORS.accent}" stroke="${COLORS.frame}" stroke-width="4"/>
  <rect x="72" y="228" width="936" height="300" fill="${COLORS.accent}" stroke="${COLORS.frame}" stroke-width="4" opacity="0.35"/>
  <rect x="72" y="1760" width="936" height="96" fill="${COLORS.panelAlt}" stroke="${COLORS.frame}" stroke-width="4"/>
  ${homeLogoMarkup}
  ${awayLogoMarkup}
  ${liveBadge}
  ${goalsPanel}
  ${statPanel}
  ${playerPanel}
  ${textPaths}
  <rect width="100%" height="100%" fill="url(#scanlines)" opacity="0.2"/>
</svg>`;
};

export const pickStoryStatLines = (
  matchStats: MatchStatsView,
  max = 6,
): MatchStoryStatLine[] => {
  const period = matchStats.periods.find((entry) => entry.key === "All");
  if (!period) {
    return [];
  }

  const rows = period.groups.flatMap((group) => group.rows);
  const picked: MatchStoryStatLine[] = [];

  for (const needle of STAT_NEEDLES) {
    const row = rows.find((entry) =>
      needle.keys.some((key) => entry.key.toLowerCase().includes(key)),
    );
    if (!row) {
      continue;
    }

    picked.push({
      label: needle.label,
      home: row.home,
      away: row.away,
      showBar: needle.label === "POS",
      homeNum: row.homeNum,
      awayNum: row.awayNum,
    });
  }

  if (picked.length === 0) {
    return rows.slice(0, max).map((row) => ({
      label: truncateName(row.label, 8),
      home: row.home,
      away: row.away,
      homeNum: row.homeNum,
      awayNum: row.awayNum,
      showBar: row.showBar,
    }));
  }

  return picked.slice(0, max);
};

export const pickStoryTopPlayers = (
  players: MatchPlayerRating[],
  max = 3,
): MatchStoryPlayerLine[] =>
  players.slice(0, max).map((player) => ({
    name: player.name,
    rating: player.rating,
    teamName: player.teamName,
    goals: player.goals,
    assists: player.assists,
  }));

export const pickStoryGoalScorers = (
  events: MatchEventView[],
  maxPerTeam = 5,
): MatchStoryGoalLine[] => {
  const home: MatchStoryGoalLine[] = [];
  const away: MatchStoryGoalLine[] = [];

  const goals = events
    .filter((event) => event.type === "goal")
    .sort((left, right) => left.minute - right.minute);

  for (const event of goals) {
    const line: MatchStoryGoalLine = {
      minute: event.minute,
      playerName: event.playerName,
      assist: event.detail?.trim() || undefined,
      team: event.team,
    };

    if (event.team === "home" && home.length < maxPerTeam) {
      home.push(line);
    } else if (event.team === "away" && away.length < maxPerTeam) {
      away.push(line);
    }
  }

  return [...home, ...away].sort((left, right) => left.minute - right.minute);
};

export const buildMatchStoryCardInput = (
  match: MatchDetailView,
  labels: {
    timeLabel: string;
    statusLabel: string;
  },
): MatchStoryCardInput => ({
  homeName: match.home.name,
  awayName: match.away.name,
  homeScore: match.home.score,
  awayScore: match.away.score,
  homeTeamId: match.home.id,
  awayTeamId: match.away.id,
  homeFifaRank: match.home.fifaRank,
  awayFifaRank: match.away.fifaRank,
  timeLabel: labels.timeLabel,
  statusLabel: labels.statusLabel,
  isLive: match.isLive,
  roundLabel: match.roundLabel,
  kickoffLabel: match.kickoffLabel,
  domain: siteConfig.publicDomain,
  insight: match.insights[0],
  statLines: pickStoryStatLines(match.matchStats),
  goalScorers: pickStoryGoalScorers(match.events),
  topPlayers: pickStoryTopPlayers(match.topPlayers),
});

export const renderMatchStoryImage = async (
  input: MatchStoryCardInput,
): Promise<Buffer> => {
  const [homeLogoBuf, awayLogoBuf] = await Promise.all([
    fetchImageBuffer(FOTMOB_TEAM_LOGO(input.homeTeamId)),
    fetchImageBuffer(FOTMOB_TEAM_LOGO(input.awayTeamId)),
  ]);

  const homeLogo = homeLogoBuf
    ? bufferToDataUrl(homeLogoBuf, "image/png")
    : null;
  const awayLogo = awayLogoBuf
    ? bufferToDataUrl(awayLogoBuf, "image/png")
    : null;

  const svg = buildSvg(input, homeLogo, awayLogo);

  return sharp(Buffer.from(svg))
    .png()
    .resize(STORY_WIDTH, STORY_HEIGHT)
    .toBuffer();
};