import type { MatchAudioLang, MatchAudioView } from "$lib/fotmob/types";

const AUDIO_LANGS: MatchAudioLang[] = [
  "ENG",
  "ESP",
  "FRA",
  "GER",
  "ITA",
  "POR",
];

const isAudioLang = (value: string): value is MatchAudioLang =>
  AUDIO_LANGS.includes(value as MatchAudioLang);

export const buildMatchAudioStreamUrl = (
  matchId: number,
  lang: MatchAudioLang,
): string => `/api/football/matches/${matchId}/audio/stream.m3u8?lang=${lang}`;

export const mapMatchAudio = (
  raw: Record<string, unknown> | null,
  matchId: number,
): MatchAudioView => {
  if (!raw || raw.available === false) {
    return {
      available: false,
      languages: [],
      streams: [],
      defaultLang: "ENG",
    };
  }

  const languages = (Array.isArray(raw.languages) ? raw.languages : [])
    .map((lang) => String(lang).toUpperCase())
    .filter(isAudioLang);

  const streams = (Array.isArray(raw.streams) ? raw.streams : [])
    .map((stream) => {
      if (!stream || typeof stream !== "object") {
        return null;
      }
      const lang = String((stream as { lang?: string }).lang ?? "").toUpperCase();
      if (!isAudioLang(lang)) {
        return null;
      }
      return {
        lang,
        streamUrl: buildMatchAudioStreamUrl(matchId, lang),
      };
    })
    .filter((stream): stream is NonNullable<typeof stream> => stream !== null);

  const defaultLang = languages.includes("ENG") ? "ENG" : (languages[0] ?? "ENG");

  return {
    available: streams.length > 0,
    languages,
    streams,
    defaultLang,
  };
};