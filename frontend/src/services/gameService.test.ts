import { vi, describe, it, expect, beforeEach } from "vitest";
import { api } from "./api";
import { gameService } from "./gameService";

vi.mock("./api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));


const getMock = api.get as unknown as ReturnType<typeof vi.fn>;
const postMock = api.post as unknown as ReturnType<typeof vi.fn>;

describe("gameService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("search calls api.get with query param and returns data", async () => {
    const fakeData = [{ id: 1, name: "Foo" }];
    getMock.mockResolvedValueOnce({ data: fakeData });

    const res = await gameService.search("foo");

    expect(getMock).toHaveBeenCalledWith("/api/games/search", { params: { q: "foo" } });
    expect(res).toBe(fakeData);
  });

  it("getById returns inner game when backend wraps response", async () => {
    const wrapped = { source: "database", game: { id: 2, name: "Bar" } };
    getMock.mockResolvedValueOnce({ data: wrapped });

    const res = await gameService.getById(2);

    expect(getMock).toHaveBeenCalledWith("/api/games/2");
    expect(res).toEqual(wrapped.game);
  });

  it("getById returns data as-is when not wrapped", async () => {
    const plain = { id: 3, name: "Baz" };
    getMock.mockResolvedValueOnce({ data: plain });

    const res = await gameService.getById(3);

    expect(getMock).toHaveBeenCalledWith("/api/games/3");
    expect(res).toEqual(plain);
  });

  it("getById returns null when response data is null", async () => {
    getMock.mockResolvedValueOnce({ data: null });

    const res = await gameService.getById(4);

    expect(getMock).toHaveBeenCalledWith("/api/games/4");
    expect(res).toBeNull();
  });

  it("addToCollection posts igdbId and status and returns data", async () => {
    const resp = { success: true };
    postMock.mockResolvedValueOnce({ data: resp });

    const res = await gameService.addToCollection(10, "playing");

    expect(postMock).toHaveBeenCalledWith("/api/games/collection", { igdbId: 10, status: "playing" });
    expect(res).toEqual(resp);
  });
});