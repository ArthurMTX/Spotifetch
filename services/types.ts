export interface Track {
    name: string;
    artists: string;
    popularity: number;
    duration: string;
    duration_ms: number;
    album_id: string;
    artist_ids: string[];
    album_cover: string;
    album_name: string;
    is_local: boolean;
    label?: string;
    album?: string;
    genres?: string[];
}
