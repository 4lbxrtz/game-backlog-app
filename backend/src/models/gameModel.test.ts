import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const mockQuery = vi.fn();
const mockGetConnection = vi.fn();

// Use non-hoisted mock so mockQuery is available to the factory
vi.doMock("../config/database", () => ({
  default: {
    query: mockQuery,
    getConnection: mockGetConnection,
  },
}));

let gameModel: any;

beforeEach(async () => {
  vi.resetModules();
  mockQuery.mockReset();
  mockGetConnection.mockReset();
  // Import the module after mocks are set up
  gameModel = await import("./gameModel");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("gameModel", () => {
  it("gameExists -> true/false based on rows", async () => {
    mockQuery.mockResolvedValueOnce([[{ id: 42 }]]);
    const existsTrue = await gameModel.gameExists(42);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id FROM games WHERE id = ?",
      [42]
    );
    expect(existsTrue).toBe(true);

    mockQuery.mockResolvedValueOnce([[]]);
    const existsFalse = await gameModel.gameExists(1);
    expect(existsFalse).toBe(false);
  });

  it("searchGamesInDatabase -> returns matching games", async () => {
    const rows = [{ id: 1, title: "Halo" }];
    mockQuery.mockResolvedValueOnce([rows]);
    const result = await gameModel.searchGamesInDatabase("Halo");
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT * FROM games WHERE title LIKE ? LIMIT 42",
      ["%Halo%"]
    );
    expect(result).toEqual(rows);
  });

  it("getGameById -> returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce([[]]); // game query
    const res = await gameModel.getGameById(999);
    expect(res).toBeNull();
  });

  it("getGameById -> returns game with genres and platforms", async () => {
    const gameRow = { id: 1, title: "Test Game" };
    const genreRows = [{ id: 10, name: "RPG" }];
    const platformRows = [{ id: 20, name: "PC" }];

    mockQuery
      .mockResolvedValueOnce([[gameRow]]) // game
      .mockResolvedValueOnce([genreRows]) // genres
      .mockResolvedValueOnce([platformRows]); // platforms

    const res = await gameModel.getGameById(1);
    expect(res).toMatchObject({
      id: 1,
      title: "Test Game",
      genres: genreRows,
      platforms: platformRows,
    });
  });

  it("upsertGenre and upsertPlatform call pool.query with correct params", async () => {
    mockQuery.mockResolvedValue([{}]);

    await gameModel.upsertGenre(5, "Action");
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO genres (id, name) VALUES (?, ?)"),
      [5, "Action", "Action"]
    );

    await gameModel.upsertPlatform(7, "Switch");
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO platforms (id, name) VALUES (?, ?)"),
      [7, "Switch", "Switch"]
    );
  });

  it("linkGameGenre and linkGamePlatform call pool.query with correct params", async () => {
    mockQuery.mockResolvedValue([{}]);

    await gameModel.linkGameGenre(1, 2);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT IGNORE INTO game_genres"),
      [1, 2]
    );

    await gameModel.linkGamePlatform(1, 3);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("INSERT IGNORE INTO game_platforms"),
      [1, 3]
    );
  });

  it("storeGameMetadata -> commits transaction on success and releases connection", async () => {
    const conn = {
      query: vi.fn().mockResolvedValue([]),
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };

    mockGetConnection.mockResolvedValue(conn);

    const igdbGame = {
      id: 100,
      name: "My Game",
      cover: { url: "cover.jpg" },
      summary: "A game",
      first_release_date: 1600000000,
      genres: [{ id: 1, name: "Adventure" }],
      platforms: [{ id: 2, name: "PC" }],
    };

    await gameModel.storeGameMetadata(igdbGame);

    expect(conn.beginTransaction).toHaveBeenCalled();
    // expected queries: 1 (game) + 2 (genre insert + link) + 2 (platform insert + link) = 5
    expect(conn.query).toHaveBeenCalledTimes(5);
    expect(conn.commit).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });

  it("storeGameMetadata -> rolls back and releases connection on error", async () => {
    const conn = {
      query: vi.fn(),
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };

    // first call (insert game) succeeds, second call fails
    conn.query
      .mockResolvedValueOnce([]) // insert game
      .mockRejectedValueOnce(new Error("db fail"));

    mockGetConnection.mockResolvedValue(conn);

    const igdbGame = {
      id: 200,
      name: "Bad Game",
      genres: [{ id: 3, name: "Shooter" }],
      platforms: [],
    };

    await expect(gameModel.storeGameMetadata(igdbGame)).rejects.toThrow(
      "db fail"
    );
    expect(conn.rollback).toHaveBeenCalled();
    expect(conn.release).toHaveBeenCalled();
  });
});