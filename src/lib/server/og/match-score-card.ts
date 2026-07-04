import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { FOTMOB_TEAM_LOGO } from "$lib/fotmob/constants";
import { siteConfig } from "$lib/config/site";

export type MatchOgCardInput = {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  homeTeamId: number;
  awayTeamId: number;
  statusLabel: string;
  roundLabel: string;
  isLive: boolean;
  competitionLabel?: string;
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const truncateName = (name: string, max = 16): string => {
  const trimmed = name.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
};

const loadPixelFontBase64 = (): string | null => {
  try {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
    const fontPath = join(
      root,
      "node_modules/@fontsource/press-start-2p/files/press-start-2p-latin-400-normal.woff2",
    );
    return readFileSync(fontPath).toString("base64");
  } catch {
    return null;
  }
};

const fetchImageDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      headers: { Accept: "image/*" },
    });
    if (!response.ok) {
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = response.headers.get("content-type") ?? "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
};

const buildSvg = (
  input: MatchOgCardInput,
  homeLogo: string | null,
  awayLogo: string | null,
  fontBase64: string | null,
): string => {
  const fontFace = fontBase64
    ? `@font-face{font-family:'Press Start 2P';src:url(data:font/woff2;base64,${fontBase64}) format('woff2');font-weight:400;font-style:normal;}`
    : "";
  const fontFamily = fontBase64
    ? "'Press Start 2P', monospace"
    : "'Courier New', monospace";

  const homeName = escapeXml(truncateName(input.homeName));
  const awayName = escapeXml(truncateName(input.awayName));
  const score = `${input.homeScore} - ${input.awayScore}`;
  const status = escapeXml(
    input.isLive ? "LIVE" : input.statusLabel || "—",
  );
  const round = escapeXml(input.roundLabel);
  const competition = escapeXml(
    input.competitionLabel ?? "FIFA World Cup",
  );
  const brand = escapeXml(siteConfig.name);
  const statusColor = input.isLive ? "#FF6B9D" : "#6B5F7A";

  const homeLogoMarkup = homeLogo
    ? `<image href="${homeLogo}" x="130" y="220" width="112" height="112" preserveAspectRatio="xMidYMid meet"/>`
    : `<rect x="130" y="220" width="112" height="112" fill="#C4BAA8" stroke="#2D1B4E" stroke-width="4"/>`;

  const awayLogoMarkup = awayLogo
    ? `<image href="${awayLogo}" x="958" y="220" width="112" height="112" preserveAspectRatio="xMidYMid meet"/>`
    : `<rect x="958" y="220" width="112" height="112" fill="#C4BAA8" stroke="#2D1B4E" stroke-width="4"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <style>
      ${fontFace}
      .pixel { font-family: ${fontFamily}; }
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#E8E0D0"/>
  <rect x="24" y="24" width="1152" height="582" fill="#E8E0D0" stroke="#2D1B4E" stroke-width="8"/>
  <rect x="48" y="48" width="1104" height="534" fill="#E8E0D0" stroke="#2D1B4E" stroke-width="4"/>

  <text x="600" y="118" text-anchor="middle" class="pixel" fill="#6B5F7A" font-size="18">${competition}</text>
  <text x="600" y="156" text-anchor="middle" class="pixel" fill="#2D1B4E" font-size="20">${round}</text>

  ${homeLogoMarkup}
  ${awayLogoMarkup}

  <text x="186" y="392" text-anchor="middle" class="pixel" fill="#2D1B4E" font-size="22">${homeName}</text>
  <text x="1014" y="392" text-anchor="middle" class="pixel" fill="#2D1B4E" font-size="22">${awayName}</text>

  <text x="600" y="318" text-anchor="middle" class="pixel" fill="#2D1B4E" font-size="72">${escapeXml(score)}</text>
  <text x="600" y="372" text-anchor="middle" class="pixel" fill="${statusColor}" font-size="22">${status}</text>

  <text x="1128" y="552" text-anchor="end" class="pixel" fill="#3DD9EB" font-size="18">${brand}</text>
</svg>`;
};

export const renderMatchOgImage = async (
  input: MatchOgCardInput,
): Promise<Buffer> => {
  const [homeLogo, awayLogo] = await Promise.all([
    fetchImageDataUrl(FOTMOB_TEAM_LOGO(input.homeTeamId)),
    fetchImageDataUrl(FOTMOB_TEAM_LOGO(input.awayTeamId)),
  ]);

  const svg = buildSvg(input, homeLogo, awayLogo, loadPixelFontBase64());

  return sharp(Buffer.from(svg)).png().resize(OG_WIDTH, OG_HEIGHT).toBuffer();
};