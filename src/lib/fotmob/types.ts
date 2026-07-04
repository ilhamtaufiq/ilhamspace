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