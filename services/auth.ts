import axios from 'axios';
import * as dotenv from 'dotenv';
import { join, dirname } from 'path';

dotenv.config({ path: join(dirname(__filename), '.env') });

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
const AUTH_URL = 'https://accounts.spotify.com/api/token';

export async function getAccessToken(): Promise<string> {
    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    const data = new URLSearchParams({
        grant_type: 'client_credentials'
    });

    try {
        const response = await axios.post(AUTH_URL, data.toString(), { headers });
        return response.data.access_token;
    } catch (error) {
        throw new Error('Failed to get access token');
    }
}