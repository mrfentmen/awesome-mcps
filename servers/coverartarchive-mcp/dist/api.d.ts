export declare class CoverArtError extends Error {
}
export interface CoverInfo {
    mbid: string;
    kind: string;
    front?: string;
    frontThumb?: string;
    back?: string;
    imageCount: number;
    allImages: string[];
}
export declare function getCover(mbid: string, kind: "release" | "release-group"): Promise<CoverInfo>;
export declare function frontUrl(mbid: string, kind: "release" | "release-group", size?: 250 | 500 | 1200): string;
export declare function formatCover(c: CoverInfo): string;
