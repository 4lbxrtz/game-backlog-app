import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4";

let accessToken: string | null = null;

async function getAccessToken(): Promise<string> {
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
    setTimeout(() => {
      accessToken = null;
    }, response.data.expires_in * 1000);

    return accessToken!;
  } catch (error) {
    console.error("Error getting Twitch token:", error);
    throw error;
  }
}

export async function searchGames(query: string, limit: number = 10) {
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
