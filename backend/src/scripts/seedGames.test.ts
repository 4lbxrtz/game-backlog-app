// ...existing code...
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("seedGames script", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    // Silence console during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("fetches one batch, stores games, then stops when IGDB returns empty batch", async () => {
    // Arrange: mocks
    const mockToken = "fake-token";
    const firstBatch = [
      { id: 1, name: "Game A" },
      { id: 2, name: "Game B" },
    ];
    const secondBatch: any[] = [];

    vi.doMock("../services/igdbService", () => ({
      getAccessToken: vi.fn(() => Promise.resolve(mockToken)),
    }));

    vi.doMock("axios", () => ({
      default: {
        post: vi
          .fn()
          // first call -> firstBatch, second call -> secondBatch
          .mockResolvedValueOnce({ data: firstBatch })
          .mockResolvedValueOnce({ data: secondBatch }),
      },
    }));

    const storeMock = vi.fn(() => Promise.resolve());
    vi.doMock("../models/gameModel", () => ({
      storeGameMetadata: storeMock,
    }));

    // Capture process.exit to know when script finished
    let exitCalledWith: number | undefined;
    const finishPromise = new Promise<void>((resolve) => {
      vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
        exitCalledWith = code;
        resolve();
        return undefined as never;
      }) as any);
    });

    // Act: import module (runs the script)
    await import("./seedGames");

    // Advance timer for the sleep between batches so the loop continues
    await vi.advanceTimersByTimeAsync(250);

    // Wait for script to call process.exit
    await finishPromise;

    // Assert
    const { getAccessToken } = await import("../services/igdbService");
    const axios = (await import("axios")).default;

    expect(getAccessToken).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalled();
    expect(storeMock).toHaveBeenCalledTimes(firstBatch.length);
    expect(exitCalledWith).toBe(0);
  });

  it("continues storing remaining games when storeGameMetadata throws for one game", async () => {
    // Arrange
    vi.doMock("../services/igdbService", () => ({
      getAccessToken: vi.fn(() => Promise.resolve("tkn")),
    }));

    const batch = [
      { id: 10, name: "One" },
      { id: 11, name: "Two" },
      { id: 12, name: "Three" },
    ];
    vi.doMock("axios", () => ({
      default: {
        post: vi
          .fn()
          .mockResolvedValueOnce({ data: batch })
          .mockResolvedValueOnce({ data: [] }),
      },
    }));

    // Make store fail for the middle game
    const storeMock = vi.fn((game: any) => {
      if (game.id === 11) return Promise.reject(new Error("DB fail"));
      return Promise.resolve();
    });
    vi.doMock("../models/gameModel", () => ({
      storeGameMetadata: storeMock,
    }));

    let exitCalled = false;
    const finishPromise = new Promise<void>((resolve) => {
      vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
        exitCalled = true;
        resolve();
        return undefined as never;
      }) as any);
    });

    // Act
    await import("./seedGames");
    await vi.advanceTimersByTimeAsync(250);
    await finishPromise;

    // Assert
    const store = (await import("../models/gameModel"))
      .storeGameMetadata as any;
    expect(store).toHaveBeenCalledTimes(batch.length);
    expect(exitCalled).toBe(true);
  });

  it("handles fetch errors gracefully and exits", async () => {
    // Arrange: make axios.post reject immediately
    vi.doMock("../services/igdbService", () => ({
      getAccessToken: vi.fn(() => Promise.resolve("tok")),
    }));

    vi.doMock("axios", () => ({
      default: { post: vi.fn(() => Promise.reject(new Error("network"))) },
    }));

    const storeMock = vi.fn();
    vi.doMock("../models/gameModel", () => ({
      storeGameMetadata: storeMock,
    }));

    let exitArgs: number | undefined;
    const finishPromise = new Promise<void>((resolve) => {
      vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
        exitArgs = code;
        resolve();
        return undefined as never;
      }) as any);
    });

    // Act
    await import("./seedGames");
    // No need to advance timers; fetch fails before sleep
    await finishPromise;

    // Assert
    expect((await import("axios")).default.post).toHaveBeenCalled();
    expect(storeMock).not.toHaveBeenCalled();
    expect(exitArgs).toBe(0);
  });
});
// ...existing code...
