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

    return accessToken;
  } catch (error) {
    console.error("Error getting Twitch token:", error);
    throw error;
  }
}
