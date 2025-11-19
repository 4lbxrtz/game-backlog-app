import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

const mockQuery = vi.fn();

// Use non-hoisted mock so mockQuery is available to the factory
vi.doMock("../config/database", () => ({
  default: {
    query: mockQuery,
  },
}));

let userModel: any;

beforeEach(async () => {
  vi.resetModules();
  mockQuery.mockReset();
  // Import the module after mocks are set up
  userModel = await import("./userModel");
});

describe("userModel", () => {
  it("createUser returns insertId", async () => {
    (mockQuery as Mock).mockResolvedValueOnce([{ insertId: 42 }]);
    const id = await userModel.createUser("alice", "a@x.com", "hash");
    expect(id).toBe(42);
    expect(mockQuery).toHaveBeenCalled();
    expect((mockQuery as Mock).mock.calls[0][0] as string).toContain(
      "INSERT INTO users"
    );
    expect((mockQuery as Mock).mock.calls[0][1]).toEqual([
      "alice",
      "a@x.com",
      "hash",
    ]);
  });

  it("findUserByEmail returns user or null", async () => {
    const userRow = {
      id: 1,
      username: "bob",
      email: "b@x.com",
      password_hash: "h",
    };
    (mockQuery as Mock).mockResolvedValueOnce([[userRow]]);
    const found = await userModel.findUserByEmail("b@x.com");
    expect(found).toEqual(userRow);

    (mockQuery as Mock).mockResolvedValueOnce([[]]);
    const notFound = await userModel.findUserByEmail("nope@x.com");
    expect(notFound).toBeNull();
  });

  it("findUserByUsername returns user or null", async () => {
    const userRow = {
      id: 2,
      username: "carol",
      email: "c@x.com",
      password_hash: "h2",
    };
    (mockQuery as Mock).mockResolvedValueOnce([[userRow]]);
    const found = await userModel.findUserByUsername("carol");
    expect(found).toEqual(userRow);

    (mockQuery as Mock).mockResolvedValueOnce([[]]);
    const notFound = await userModel.findUserByUsername("missing");
    expect(notFound).toBeNull();
  });

  it("findUserById returns user or null", async () => {
    const userRow = {
      id: 3,
      username: "dan",
      email: "d@x.com",
      password_hash: "h3",
    };
    (mockQuery as Mock).mockResolvedValueOnce([[userRow]]);
    const found = await userModel.findUserById(3);
    expect(found).toEqual(userRow);

    (mockQuery as Mock).mockResolvedValueOnce([[]]);
    const notFound = await userModel.findUserById(999);
    expect(notFound).toBeNull();
  });

  it("emailExists and usernameExists return correct booleans", async () => {
    (mockQuery as Mock).mockResolvedValueOnce([[{ id: 1 }]]);
    expect(await userModel.emailExists("e@x.com")).toBe(true);

    (mockQuery as Mock).mockResolvedValueOnce([[]]);
    expect(await userModel.emailExists("none@x.com")).toBe(false);

    (mockQuery as Mock).mockResolvedValueOnce([[{ id: 2 }]]);
    expect(await userModel.usernameExists("frank")).toBe(true);

    (mockQuery as Mock).mockResolvedValueOnce([[]]);
    expect(await userModel.usernameExists("ghost")).toBe(false);
  });

  it("getUserStats aggregates statuses and formats average rating", async () => {
    // statusRows
    (mockQuery as Mock).mockResolvedValueOnce([
      [
        { status: "Completed", count: 2 },
        { status: "Playing", count: 1 },
        { status: "Backlog", count: 5 },
      ],
    ]);
    // ratingRows
    (mockQuery as Mock).mockResolvedValueOnce([[{ avg_rating: "4.25" }]]);

    const stats = await userModel.getUserStats(7);
    expect(stats.completed).toBe(2);
    expect(stats.playing).toBe(1);
    expect(stats.backlog).toBe(5);
    expect(stats.wishlist).toBe(0);
    expect(stats.abandoned).toBe(0);
    expect(stats.averageRating).toBe("4.3");
  });

  it("getUserStats returns 0.0 when no average rating", async () => {
    (mockQuery as Mock).mockResolvedValueOnce([[]]); // no status rows
    (mockQuery as Mock).mockResolvedValueOnce([[{ avg_rating: null }]]); // no rating
    const stats = await userModel.getUserStats(8);
    expect(stats.averageRating).toBe("0.0");
  });

  it("getCurrentlyPlayingGames returns rows and respects limit", async () => {
    const rows = [{ id: 1, title: "Game A", cover_url: "u" }];
    (mockQuery as Mock).mockResolvedValueOnce([rows]);
    const res = await userModel.getCurrentlyPlayingGames(9, 2);
    expect(res).toEqual(rows);
    expect(mockQuery).toHaveBeenCalled();
    // check that userId and limit were passed as params
    expect((mockQuery as Mock).mock.calls[0][1]).toEqual([9, 2]);
  });

  it("getBacklogGames returns rows and respects default limit", async () => {
    const rows = [{ id: 4, title: "Game B", cover_url: "u2" }];
    (mockQuery as Mock).mockResolvedValueOnce([rows]);
    const res = await userModel.getBacklogGames(10);
    expect(res).toEqual(rows);
    expect((mockQuery as Mock).mock.calls[0][1]).toEqual([10, 6]); // default limit = 6
  });

  it("getUserLists returns lists with game_count", async () => {
    const lists = [
      { id: 1, name: "Favorites", description: "x", game_count: 3 },
    ];
    (mockQuery as Mock).mockResolvedValueOnce([lists]);
    const res = await userModel.getUserLists(11);
    expect(res).toEqual(lists);
    expect((mockQuery as Mock).mock.calls[0][1]).toEqual([11]);
  });
});
