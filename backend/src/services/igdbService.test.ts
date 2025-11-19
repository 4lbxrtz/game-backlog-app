import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import axios from "axios";

vi.mock("axios");
const mockedAxios = axios as unknown as { post: any };

const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4";

describe("./igdbService.ts", () => {
  // Keep test environment isolated between tests
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Provide required env vars for the module under test
    process.env.TWITCH_CLIENT_ID = "test-client-id";
    process.env.TWITCH_CLIENT_SECRET = "test-client-secret";
  });

  afterEach(() => {
    // Ensure fake timers are restored if a test used them
    try {
      vi.useRealTimers();
    } catch {
      // ignore if already real
    }
  });

  it("getAccessToken caches token and refreshes after expiry", async () => {
    // Use fake timers to simulate expiry
    vi.useFakeTimers();

    // First token response: expires in 2 seconds
    mockedAxios.post
      .mockResolvedValueOnce({
        data: { access_token: "tok1", expires_in: 2 },
      })
      // Second token response after expiry
      .mockResolvedValueOnce({
        data: { access_token: "tok2", expires_in: 3600 },
      });

    // Import fresh module
    const { getAccessToken } = await import("./igdbService");

    // First call obtains token tok1
    const t1 = await getAccessToken();
    expect(t1).toBe("tok1");
    expect(mockedAxios.post).toHaveBeenCalledWith(
      TWITCH_TOKEN_URL,
      null,
      expect.objectContaining({
        params: expect.objectContaining({
          client_id: "test-client-id",
          client_secret: "test-client-secret",
          grant_type: "client_credentials",
        }),
      })
    );

    // Second call before expiry returns cached token without new axios.post
    const t1b = await getAccessToken();
    expect(t1b).toBe("tok1");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);

    // Advance timers past expiry (2s -> 2000ms)
    vi.advanceTimersByTime(2000 + 10);

    // After expiry, next call should fetch a new token (tok2)
    const t2 = await getAccessToken();
    expect(t2).toBe("tok2");
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("searchIGDB posts search query with proper headers and returns data", async () => {
    // First call to axios.post returns token, second returns IGDB search data
    mockedAxios.post
      .mockResolvedValueOnce({
        data: { access_token: "search-token", expires_in: 3600 },
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: "Test Game" }],
      });

    const { searchIGDB } = await import("./igdbService");

    const results = await searchIGDB("Test", 5);
    expect(results).toEqual([{ id: 1, name: "Test Game" }]);

    // The second axios.post call should be to the IGDB games endpoint
    expect(mockedAxios.post).toHaveBeenLastCalledWith(
      `${IGDB_API_URL}/games`,
      expect.stringContaining('search "Test"'),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Client-ID": "test-client-id",
          Authorization: "Bearer search-token",
        }),
      })
    );
  });

  it("getGameDetails posts query with where id and returns first result", async () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: { access_token: "details-token", expires_in: 3600 },
      })
      .mockResolvedValueOnce({
        data: [{ id: 42, name: "The Answer Game" }],
      });

    const { getGameDetails } = await import("./igdbService");

    const game = await getGameDetails(42);
    expect(game).toEqual({ id: 42, name: "The Answer Game" });

    expect(mockedAxios.post).toHaveBeenLastCalledWith(
      `${IGDB_API_URL}/games`,
      expect.stringContaining("where id = 42"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Client-ID": "test-client-id",
          Authorization: "Bearer details-token",
        }),
      })
    );
  });

  it("handles invalid expires_in by using 1 hour fallback and warns", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "bad-exp-token", expires_in: "not-a-number" },
    });

    // Import and call
    const { getAccessToken } = await import("./igdbService");
    const t = await getAccessToken();
    expect(t).toBe("bad-exp-token");

    // Expect a warning about invalid expires_in
    expect(warnSpy).toHaveBeenCalledWith(
      "Warning: invalid expires_in from token response, using 1 hour fallback."
    );

    warnSpy.mockRestore();
  });

  it("logs a warning when token expiry exceeds Node max timeout (chunking)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Create an expires_in large enough to exceed MAX_SAFE_TIMEOUT_MS
    const maxMs = 0x7fffffff;
    const largeExpiresSec = Math.floor(maxMs / 1000) + 10;
    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: "huge-token", expires_in: largeExpiresSec },
    });

    const { getAccessToken } = await import("./igdbService");
    const t = await getAccessToken();
    expect(t).toBe("huge-token");

    // Expect a warning mentioning scheduling in chunks
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Warning: token expiry (")
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("exceeds Node max timeout")
    );

    warnSpy.mockRestore();
  });
});
