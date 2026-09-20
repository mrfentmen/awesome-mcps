export declare class ChessComError extends Error {
}
export interface PlayerProfile {
    username: string;
    title?: string;
    name?: string;
    followers?: number;
    country?: string;
    joined?: string;
    lastOnline?: string;
    league?: string;
    url?: string;
}
export declare function getPlayer(username: string): Promise<PlayerProfile>;
export interface RatingLine {
    rating?: number;
    best?: number;
    record?: string;
}
export interface PlayerStats {
    daily?: RatingLine;
    rapid?: RatingLine;
    blitz?: RatingLine;
    bullet?: RatingLine;
    tactics?: {
        highest?: number;
    };
    puzzleRush?: {
        best?: number;
    };
}
export declare function getStats(username: string): Promise<PlayerStats>;
export interface DailyPuzzle {
    title?: string;
    url?: string;
    fen?: string;
    publishDate?: string;
}
export declare function dailyPuzzle(): Promise<DailyPuzzle>;
export interface LeaderEntry {
    rank?: number;
    username: string;
    score?: number;
    country?: string;
}
export declare const LEADERBOARD_CATEGORIES: readonly ["daily", "live_rapid", "live_blitz", "live_bullet", "tactics"];
export declare function leaderboards(category: (typeof LEADERBOARD_CATEGORIES)[number], limit?: number): Promise<LeaderEntry[]>;
export declare function formatProfile(p: PlayerProfile): string;
export declare function formatStats(username: string, s: PlayerStats): string;
export declare function formatPuzzle(p: DailyPuzzle): string;
export declare function formatLeaders(category: string, rows: LeaderEntry[]): string;
