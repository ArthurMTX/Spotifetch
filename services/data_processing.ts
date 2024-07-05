import {convertDurationTotal} from "@/services/utils";

export function calculateStats(tracks: any[]): any {
    const numTracks = tracks.length;
    const totalDurationMs = tracks.reduce((acc, track) => acc + track.duration_ms, 0);
    const totalDuration = convertDurationTotal(totalDurationMs);

    const artistCounter: { [key: string]: number } = {};
    const labelCounter: { [key: string]: number } = {};
    const genreCounter: { [key: string]: number } = {};

    for (const track of tracks) {
        const artists = track.artists.split(', ');
        for (const artist of artists) {
            artistCounter[artist] = (artistCounter[artist] || 0) + 1;
        }
        labelCounter[track.label] = (labelCounter[track.label] || 0) + 1;

        const genres = track.genres;
        for (const genre of genres) {
            genreCounter[genre] = (genreCounter[genre] || 0) + 1;
        }
    }

    const sortedArtists = Object.entries(artistCounter).sort((a, b) => b[1] - a[1]);
    const sortedLabels = Object.entries(labelCounter).sort((a, b) => b[1] - a[1]);
    const sortedGenres = Object.entries(genreCounter).sort((a, b) => b[1] - a[1]);

    return {
        number_of_tracks: numTracks,
        total_duration: totalDuration,
        artists_sorted_by_appearance: sortedArtists,
        labels_sorted_by_appearance: sortedLabels,
        genres_sorted_by_appearance: sortedGenres,
    };
}
