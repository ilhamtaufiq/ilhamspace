export type FotmobApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PlayoffMatchStatus = {
  utcTime?: string;
  finished?: boolean;
  started?: boolean;
  scoreStr?: string;
  reason?: {
    short?: string;
    long?: string;
  };
};

export type PlayoffMatch = {
  matchId: number;
  home: { id: number; name: string; shortName?: string; score?: number };
  away: { id: number; name: string; shortName?: string; score?: number };
  status?: PlayoffMatchStatus;
};

export type PlayoffMatchup = {
  drawOrder?: number;
  stage?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamShortName?: string;
  awayTeamShortName?: string;
  homeScore?: number;
  awayScore?: number;
  winner?: number;
  aggregatedWinner?: number;
  tbdTeam1?: boolean;
  tbdTeam2?: boolean;
  matches?: PlayoffMatch[];
};

export type PlayoffRound = {
  stage: string;
  participantCount?: number;
  matchups: PlayoffMatchup[];
};

export type LeaguePlayoffData = {
  leagueId: number;
  leagueName?: string;
  season?: string | null;
  rounds: PlayoffRound[];
  bronzeFinal?: PlayoffMatchup | null;
  draw?: unknown;
  hasDrawOrder?: boolean;
};

export type KnockoutMatchupView = {
  id: string;
  stage: string;
  homeName: string;
  awayName: string;
  homeShort: string;
  awayShort: string;
  homeTeamId?: number;
  awayTeamId?: number;
  score: string;
  statusLabel: string;
  winnerTeamId?: number;
  matchId?: number;
  isTbd: boolean;
  isLive: boolean;
  isFinished: boolean;
};

export type KnockoutRoundView = {
  stage: string;
  label: string;
  matchups: KnockoutMatchupView[];
};

export type MatchTeamView = {
  id: number;
  name: string;
  score: number;
  fifaRank?: number;
};

export type MatchStatRow = {
  key: string;
  label: string;
  home: string;
  away: string;
  homeNum: number;
  awayNum: number;
  showBar?: boolean;
  highlighted?: "home" | "away" | "equal";
};

export type MatchStatPeriodKey = "All" | "FirstHalf" | "SecondHalf";

export type MatchStatGroup = {
  key: string;
  title: string;
  rows: MatchStatRow[];
};

export type MatchStatPeriod = {
  key: MatchStatPeriodKey;
  label: string;
  groups: MatchStatGroup[];
};

export type MatchStatsView = {
  periods: MatchStatPeriod[];
  hasData: boolean;
};

export type MatchEventView = {
  id: string;
  minute: number;
  type: "goal" | "card";
  team: "home" | "away";
  playerName: string;
  detail?: string;
  scoreAfter?: string;
};

export type MatchLineupPlayer = {
  id: number;
  name: string;
  shortName: string;
  shirtNumber: string;
  rating?: number;
  pitchX: number;
  pitchY: number;
};

export type MatchLineupView = {
  teamName: string;
  teamId: number;
  formation: string;
  teamColor?: string;
  starters: MatchLineupPlayer[];
  subs: MatchLineupPlayer[];
};

export type MatchPlayerRating = {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  shirtNumber: string;
  rating: number;
  goals: number;
  assists: number;
  xg: number;
  minutes: number;
};

export type MatchPlayerStatItem = {
  key: string;
  label: string;
  value: string;
};

export type MatchPlayerStatGroup = {
  key: string;
  title: string;
  items: MatchPlayerStatItem[];
};

export type MatchPlayerDetail = {
  id: number;
  name: string;
  teamId: number;
  teamName: string;
  shirtNumber: string;
  isGoalkeeper?: boolean;
  groups: MatchPlayerStatGroup[];
  hasStats: boolean;
};

export type MatchPlayerStatsIndex = Record<number, MatchPlayerDetail>;

export type MatchH2HRecord = {
  homeWins: number;
  draws: number;
  awayWins: number;
  recent: Array<{
    date: string;
    homeName: string;
    awayName: string;
    score: string;
    homeId: number;
    awayId: number;
  }>;
};

export type MatchShotView = {
  id: number;
  teamId: number;
  playerName: string;
  x: number;
  y: number;
  minute: number;
  isGoal: boolean;
  isOnTarget: boolean;
  xg: number;
};

export type MatchMomentumPoint = {
  minute: number;
  value: number;
};

export type MatchCommentaryEntry = {
  id: string;
  minute: string;
  type: string;
  description: string;
  isHighlight: boolean;
  team?: "home" | "away";
};

export type MatchCommentaryView = {
  entries: MatchCommentaryEntry[];
  hasData: boolean;
  lastUpdated?: string;
};

export type MatchPlayByPlayKind =
  | "goal"
  | "assist"
  | "card"
  | "substitution"
  | "half"
  | "added_time"
  | "injury"
  | "comment"
  | "summary"
  | "other";

export type MatchPlayByPlayEntry = {
  id: string;
  kind: MatchPlayByPlayKind;
  source: "facts" | "ltc";
  minute: string;
  sortKey: number;
  team?: "home" | "away";
  playerName?: string;
  title?: string;
  description?: string;
  scoreAfter?: string;
  isHighlight: boolean;
};

export type MatchPlayByPlayView = {
  entries: MatchPlayByPlayEntry[];
  hasData: boolean;
  lastUpdated?: string;
};

export type MatchDetailView = {
  matchId: number;
  round: string;
  roundLabel: string;
  kickoff: string;
  kickoffLabel: string;
  statusShort: string;
  statusLong: string;
  matchMinute: string;
  isLive: boolean;
  isFinished: boolean;
  home: MatchTeamView;
  away: MatchTeamView;
  stats: MatchStatRow[];
  matchStats: MatchStatsView;
  events: MatchEventView[];
  insights: string[];
  playerOfMatch?: {
    id: number;
    name: string;
    teamName: string;
    rating: number;
  };
  homeLineup?: MatchLineupView;
  awayLineup?: MatchLineupView;
  topPlayers: MatchPlayerRating[];
  playerStatsById: MatchPlayerStatsIndex;
  h2h?: MatchH2HRecord;
  momentum: MatchMomentumPoint[];
  shots: MatchShotView[];
};