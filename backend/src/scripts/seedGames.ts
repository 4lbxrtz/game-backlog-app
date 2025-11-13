import { getAccessToken } from "../services/igdbService";
import { storeGameMetadata } from "../models/gameModel";
import axios from "axios";

const IGDB_API_URL = "https://api.igdb.com/v4";
const BATCH_SIZE = 500; // IGDB's maximum
const DELAY_BETWEEN_REQUESTS = 250; // 4 requests/second = 250ms between requests

// Helper: Sleep function for rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch a batch of games from IGDB
async function fetchGameBatch(offset: number, filters: string): Promise<any[]> {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${IGDB_API_URL}/games`,
      `${filters}
       fields name, cover.url, summary, first_release_date, 
              genres.id, genres.name,
              platforms.id, platforms.name,
              rating, rating_count;
       limit ${BATCH_SIZE};
       offset ${offset};`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching batch:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  // Start with MINIMAL filters to test
  const filters = `
  `;
  // Just filter for main games, nothing else

  let offset = 0;
  let totalFetched = 0;
  let totalStored = 0;
  let hasMore = true;

  // ADD THIS LIMIT FOR TESTING
  const MAX_GAMES_TO_FETCH = 700000

  while (hasMore) {
    try {
      console.log(`📦 Fetching batch at offset ${offset}...`);

      const games = await fetchGameBatch(offset, filters);

      if (games.length === 0) {
        hasMore = false;
        console.log("\n✅ No more games to fetch.");
        break;
      }

      console.log(`   Retrieved ${games.length} games`);
      console.log(`   First game: ${games[0]?.name || "N/A"}`);

      totalFetched += games.length;

      // Store each game
      for (const game of games) {
        try {
          await storeGameMetadata(game);
          totalStored++;

          if (totalStored % 10 === 0) {
            console.log(`   💾 Stored ${totalStored} games so far...`);
          }
        } catch (error: any) {
          console.error(
            `   ❌ Failed to store game ${game.id} (${game.name}):`,
            error.message
          );
        }
      }

      console.log(
        `   ✓ Batch complete. Total: ${totalStored}/${totalFetched} stored\n`
      );

      offset += BATCH_SIZE;

      // TEST LIMIT
      if (totalFetched >= MAX_GAMES_TO_FETCH) {
        console.log(
          `⚠️  Reached ${MAX_GAMES_TO_FETCH} games test limit. Stopping.`
        );
        hasMore = false;
        break;
      }

      await sleep(DELAY_BETWEEN_REQUESTS);
    } catch (error: any) {
      console.error("❌ Error during seeding:", error.message);
      console.error("Full error:", error);
      hasMore = false;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Seeding complete!`);
  console.log(`   Total fetched: ${totalFetched}`);
  console.log(`   Total stored: ${totalStored}`);
  console.log(`   Failed: ${totalFetched - totalStored}`);
  console.log("=".repeat(50));

  process.exit(0);
}

// Run the script
seedDatabase().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
