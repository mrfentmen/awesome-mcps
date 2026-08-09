export declare class UsgsError extends Error {
}
export interface Quake {
    id?: string;
    mag?: number;
    place?: string;
    time?: string;
    depthKm?: number;
    lat?: number;
    lon?: number;
    url?: string;
    type?: string;
}
export declare function latestQuakes(magnitude?: string, timeframe?: string, limit?: number): Promise<Quake[]>;
export declare function queryQuakes(minMagnitude?: number, limit?: number, starttime?: string): Promise<Quake[]>;
export declare function formatQuake(q: Quake): string;
