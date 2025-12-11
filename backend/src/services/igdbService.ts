import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4";

let accessToken: string | null = null;

export async function getAccessToken(): Promise<string> {
  if (accessToken) return accessToken;

  try {
    const response = await axios.post(TWITCH_TOKEN_URL, null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    });

    accessToken = response.data.access_token;

    // Token expires, so refresh it periodically
    // Guard against very large values that cause Node's TimeoutOverflowWarning.
    // Node's setTimeout maximum allowed delay is 2^31-1 ms (~24.8 days).
    const MAX_SAFE_TIMEOUT_MS = 0x7fffffff; // 2_147_483_647
    const expiresInSec = Number(response.data.expires_in) || 0;
    let expiresMs = expiresInSec * 1000;

    if (!Number.isFinite(expiresMs) || expiresMs <= 0) {
      // If the API didn't return a valid expiry, fall back to 1 hour and warn.
      console.warn(
        "Warning: invalid expires_in from token response, using 1 hour fallback."
      );
      expiresMs = 60 * 60 * 1000;
    }

    // If expiresMs is larger than Node's max timeout, schedule invalidation in chunks.
    function scheduleTokenInvalidation(remainingMs: number) {
      if (remainingMs <= MAX_SAFE_TIMEOUT_MS) {
        // Final chunk: invalidate after remainingMs
        setTimeout(() => {
          accessToken = null;
        }, remainingMs);
      } else {
        // Schedule a chunk, then recursively schedule the rest when it fires.
        setTimeout(() => {
          // After this chunk fires, schedule the next chunk(s)
          scheduleTokenInvalidation(remainingMs - MAX_SAFE_TIMEOUT_MS);
        }, MAX_SAFE_TIMEOUT_MS);
      }
    }

    if (expiresMs > MAX_SAFE_TIMEOUT_MS) {
      console.warn(
        `Warning: token expiry (${expiresMs}ms) exceeds Node max timeout. Scheduling invalidation in chunks of ${MAX_SAFE_TIMEOUT_MS}ms.`
      );
    }

    scheduleTokenInvalidation(expiresMs);

    return accessToken!;
  } catch (error) {
    console.error("Error getting Twitch token:", error);
    throw error;
  }
}

export async function searchIGDB(query: string, limit: number = 10) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${IGDB_API_URL}/games`,
      `search "${query}"; fields name, cover.url, summary, first_release_date, genres.name, platforms.name; limit ${limit};`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error searching games:", error);
    throw error;
  }
}

export async function getGameDetails(igdbId: number) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${IGDB_API_URL}/games`,
      `where id = ${igdbId}; 
       fields name, cover.url, summary, first_release_date, 
              genres.id, genres.name, 
              platforms.id, platforms.name;`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data[0];
  } catch (error) {
    console.error("Error fetching game details:", error);
    throw error;
  }
}


