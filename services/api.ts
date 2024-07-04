import axios from 'axios';
import { convertDuration } from './utils';
import { Track } from './types';
import {getAccessToken} from "@/services/auth";
import {calculateStats} from "@/services/data_processing";

export const PLAYLIST_API_URL = 'https://api.spotify.com/v1/playlists/';
export const ALBUMS_API_URL = 'https://api.spotify.com/v1/albums';
export const ARTISTS_API_URL = 'https://api.spotify.com/v1/artists';

export async function fetchTracksPage(url: string, headers: any, offset: number): Promise<Track[]> {
    const params = { limit: 100, offset: offset };
    const response = await axios.get(url, { headers, params });

    if (response.status !== 200) {
        return [];
    }

    const data = response.data;
    const tracks: Track[] = [];

    for (const trackData of data.items) {
        const track = trackData.track;
        if (!track) continue;

        const album = track.album;
        const artists = track.artists;
        const isLocal = track.is_local || false;

        let albumId = 'Unknown';
        let artistNames = 'Unknown';
        let artistIds = ['Unknown'];

        if (isLocal) {
            albumId = 'LOCAL_ARTIST';
            artistNames = 'LOCAL_ARTIST';
            artistIds = ['LOCAL_ARTIST'];
        } else {
            albumId = album ? album.id : 'Unknown';
            artistNames = artists.map((artist: any) => artist.name).join(', ');
            artistIds = artists.map((artist: any) => artist.id);
        }

        tracks.push({
            name: track.name || 'Unknown',
            artists: artistNames,
            popularity: track.popularity || 0,
            duration: convertDuration(track.duration_ms || 0),
            duration_ms: track.duration_ms || 0,
            album_id: albumId,
            artist_ids: artistIds,
            album_cover: album && album.images ? album.images[0].url : '',
            album_name: album ? album.name || 'Unknown' : 'Unknown',
            is_local: isLocal
        });
    }

    return tracks;
}

export async function getAllTracks(playlistId: string, accessToken: string): Promise<Track[]> {
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const url = `${PLAYLIST_API_URL}${playlistId}/tracks`;
    const params = { limit: 100, offset: 0 };
    const tracks: Track[] = [];

    const response = await axios.get(url, { headers, params });
    if (response.status !== 200) {
        return [];
    }

    tracks.push(...await fetchTracksPage(url, headers, 0));
    const totalTracks = response.data.total;
    const remainingPages = Math.floor((totalTracks - 100) / 100) + 1;

    const promises = [];
    for (let page = 1; page <= remainingPages; page++) {
        const offset = page * 100;
        promises.push(fetchTracksPage(url, headers, offset));
    }

    const results = await Promise.all(promises);
    for (const result of results) {
        tracks.push(...result);
    }

    return tracks;
}

export async function fetchAlbumLabels(albumIds: string[], headers: any): Promise<[Record<string, string>, Record<string, string>]> {
    const validAlbumIds = albumIds.filter(albumId => albumId !== 'LOCAL_ARTIST');
    if (!validAlbumIds.length) return [{}, {}];

    const params = { ids: validAlbumIds.join(',') };
    const response = await axios.get(ALBUMS_API_URL, { headers, params });
    if (response.status !== 200) return [{}, {}];

    const albums = response.data.albums;
    const albumLabels: Record<string, string> = {};
    const albumNames: Record<string, string> = {};

    for (const album of albums) {
        albumLabels[album.id] = album.label || 'Unknown';
        albumNames[album.id] = album.name || 'Unknown';
    }

    albumIds.forEach(albumId => {
        if (albumId === 'LOCAL_ARTIST') {
            albumLabels[albumId] = 'LOCAL_ARTIST';
            albumNames[albumId] = 'LOCAL_ARTIST';
        }
    });

    return [albumLabels, albumNames];
}

export async function fetchArtistGenres(artistIds: string[], headers: any): Promise<Record<string, string[]>> {
    const params = { ids: artistIds.join(',') };
    const response = await axios.get(ARTISTS_API_URL, { headers, params });
    if (response.status !== 200) return {};

    const artists = response.data.artists;
    const artistGenres: Record<string, string[]> = {};

    for (const artist of artists) {
        artistGenres[artist.id] = artist.genres || [];
    }

    return artistGenres;
}

export function getOwnerImage(ownerData: any): string {
    const images = ownerData.images || [];
    return images.length ? images[0].url : '';
}

export async function getPlaylistInfo(playlistId: string): Promise<any> {
    const accessToken = await getAccessToken();
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    const response = await axios.get(`${PLAYLIST_API_URL}${playlistId}`, { headers });

    if (response.status === 200) {
        const playlistData = response.data;
        const tracks = await getAllTracks(playlistId, accessToken);
        const stats = calculateStats(tracks);

        const ownerImage = getOwnerImage(playlistData.owner);

        return {
            name: playlistData.name,
            description: playlistData.description,
            followers: playlistData.followers.total,
            url: playlistData.external_urls.spotify,
            owner: playlistData.owner.display_name,
            owner_image: ownerImage,
            image: playlistData.images[0].url,
            tracks: tracks.map(track => ({
                name: track.name,
                artists: track.artists,
                popularity: track.popularity,
                duration: track.duration,
                label: track.label,
                album_name: track.album_name,
                album_cover: track.album_cover,
                genres: track.genres,
                is_local: track.is_local
            })),
            stats: stats
        };
    } else {
        return {};
    }
}
