import { readFileSync } from "node:fs";
import { join } from "node:path";

import opentype, { type Font } from "opentype.js";
import sharp from "sharp";

import { siteConfig } from "$lib/config/site";
import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";

export type MatchOgCardInput = {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeTeamId: number;
  awayTeamId: number;
  homeFifaRank?: number;
  awayFifaRank?: number;
  statusLabel: string;
  timeLabel: string;
  isLive: boolean;
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const COLORS = {
  background: "#0D0D0D",
  score: "#FFB000",
  team: "#FFB000",
  fifa: "#CC8C00",
  live: "#FF6B9D",
  status: "#CC8C00",
  brand: "#39FF14",
  logoFallback: "#1A1A1A",
  logoBorder: "#FFB000",
} as const;

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

  throw new Error("Press Start 2P font not found for OG image rendering");
};

const truncateName = (name: string, max = 14): string => {
  const upper = name.trim().toUpperCase();
  if (upper.length <= max) {
    return upper;
  }
  return `${upper.slice(0, max - 1)}…`;
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
  anchor: "start" | "middle" = "start",
): string => {
  const resolvedX =
    anchor === "middle" ? x - textWidth(font, text, size) / 2 : x;
  const path = font.getPath(text, resolvedX, y, size);
  return `<path d="${path.toPathData(2)}" fill="${fill}"/>`;
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

const buildSvg = (
  input: MatchOgCardInput,
  homeLogo: string | null,
  awayLogo: string | null,
): string => {
  const font = loadPixelFont();

  const homeName = truncateName(input.homeName);
  const awayName = truncateName(input.awayName);
  const score = `${input.homeScore} - ${input.awayScore}`;
  const timeLabel = input.timeLabel.trim().toUpperCase();
  const statusLabel = input.statusLabel.trim() || "—";
  const brand = siteConfig.name.toLowerCase();

  const homeFifa = input.homeFifaRank
    ? `FIFA ${input.homeFifaRank}`
    : "";
  const awayFifa = input.awayFifaRank
    ? `FIFA ${input.awayFifaRank}`
    : "";

  const timeColor = input.isLive ? COLORS.live : COLORS.score;
  const logoY = 170;
  const logoSize = 112;
  const homeLogoX = 130;
  const awayLogoX = 958;

  const homeLogoCx = homeLogoX + logoSize / 2;
  const awayLogoCx = awayLogoX + logoSize / 2;
  const logoCy = logoY + logoSize / 2;

  const homeLogoMarkup = homeLogo
    ? `<image href="${homeLogo}" x="${homeLogoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#home-logo-clip)"/>`
    : `<circle cx="${homeLogoCx}" cy="${logoCy}" r="56" fill="${COLORS.logoFallback}" stroke="${COLORS.logoBorder}" stroke-width="4"/>`;

  const awayLogoMarkup = awayLogo
    ? `<image href="${awayLogo}" x="${awayLogoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" clip-path="url(#away-logo-clip)"/>`
    : `<circle cx="${awayLogoCx}" cy="${logoCy}" r="56" fill="${COLORS.logoFallback}" stroke="${COLORS.logoBorder}" stroke-width="4"/>`;

  const textPaths = [
    timeLabel
      ? textPath(font, timeLabel, 600, 248, 28, timeColor, "middle")
      : "",
    textPath(font, score, 600, 340, 56, COLORS.score, "middle"),
    textPath(font, statusLabel, 600, 392, 16, COLORS.status, "middle"),
    textPath(font, homeName, 186, 420, 20, COLORS.team, "middle"),
    textPath(font, awayName, 1014, 420, 20, COLORS.team, "middle"),
    homeFifa
      ? textPath(font, homeFifa, 186, 452, 14, COLORS.fifa, "middle")
      : "",
    awayFifa
      ? textPath(font, awayFifa, 1014, 452, 14, COLORS.fifa, "middle")
      : "",
    textPath(font, brand, 1128, 580, 14, COLORS.brand, "middle"),
  ].join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <clipPath id="home-logo-clip">
      <circle cx="${homeLogoCx}" cy="${logoCy}" r="56"/>
    </clipPath>
    <clipPath id="away-logo-clip">
      <circle cx="${awayLogoCx}" cy="${logoCy}" r="56"/>
    </clipPath>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.background}"/>
  ${homeLogoMarkup}
  ${awayLogoMarkup}
  ${textPaths}
</svg>`;
};

const bufferToDataUrl = (buffer: Buffer, mime: string): string =>
  `data:${mime};base64,${buffer.toString("base64")}`;

export const renderMatchOgImage = async (
  input: MatchOgCardInput,
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

  return sharp(Buffer.from(svg)).png().resize(OG_WIDTH, OG_HEIGHT).toBuffer();
};

export const buildMatchOgTimeLabel = (input: {
  isLive: boolean;
  isFinished: boolean;
  matchMinute: string;
  statusShort: string;
}): string => {
  if (input.isFinished) {
    return input.statusShort || "FT";
  }
  if (input.isLive && input.matchMinute) {
    return input.matchMinute;
  }
  if (input.isLive) {
    return "LIVE";
  }
  return input.statusShort;
};

export const buildMatchOgStatusLabel = (input: {
  statusLong: string;
  statusShort: string;
  isLive: boolean;
  isFinished: boolean;
}): string => {
  if (input.isLive) {
    return input.statusLong || input.statusShort || "—";
  }
  if (input.isFinished) {
    return input.statusLong || input.statusShort || "FT";
  }
  return input.statusLong || input.statusShort || "—";
};