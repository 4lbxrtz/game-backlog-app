import { vi, describe, it, expect, beforeEach } from "vitest";
import { searchGamesController, getGameController } from "./gameController";
import * as igdbService from "../services/igdbService";
import * as gameModel from "../models/gameModel";

// Mock external modules before importing the controller under test
vi.mock("../services/igdbService", () => ({
  getGameDetails: vi.fn(),
  searchIGDB: vi.fn(),
}));
vi.mock("../models/gameModel", () => ({
  searchGamesInDatabase: vi.fn(),
  gameExists: vi.fn(),
  storeGameMetadata: vi.fn(),
  getGameById: vi.fn(),
}));

function makeReqRes() {
  const req: any = { query: {}, params: {}, body: {} };
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe("searchGamesController", () => {
  it("returns 400 when query missing or too short", async () => {
    const { req, res } = makeReqRes();
    // no query
    await searchGamesController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();

    // too short
    res.status.mockClear();
    res.json.mockClear();
    req.query.q = "a";
    await searchGamesController(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it("returns database results when found", async () => {
    const { req, res } = makeReqRes();
    req.query.q = "zelda";

    const dbGames = [{ id: 1, name: "Zelda" }];
    (gameModel.searchGamesInDatabase as unknown as vi.Mock).mockResolvedValue(
      dbGames
    );

    await searchGamesController(req, res);

    expect(gameModel.searchGamesInDatabase).toHaveBeenCalledWith("zelda");
    expect(res.json).toHaveBeenCalledWith(dbGames);
  });

  it("searches IGDB when not in database and returns igdb source", async () => {
    const { req, res } = makeReqRes();
    req.query.q = "mario";

    (gameModel.searchGamesInDatabase as unknown as vi.Mock).mockResolvedValue(
      []
    );
    const igdbGames = [{ id: 10, name: "Super Mario" }];
    (igdbService.searchIGDB as unknown as vi.Mock).mockResolvedValue(igdbGames);

    await searchGamesController(req, res);

    expect(gameModel.searchGamesInDatabase).toHaveBeenCalledWith("mario");
    expect(igdbService.searchIGDB).toHaveBeenCalledWith("mario");
    expect(res.json).toHaveBeenCalledWith({ source: "igdb", games: igdbGames });
  });

  it("handles errors and responds with 500", async () => {
    const { req, res } = makeReqRes();
    req.query.q = "errorcase";

    (gameModel.searchGamesInDatabase as unknown as vi.Mock).mockRejectedValue(
      new Error("boom")
    );

    await searchGamesController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to search games" });
  });
});

describe("getGameController", () => {
  it("returns game from database when exists", async () => {
    const { req, res } = makeReqRes();
    req.params.id = "42";

    (gameModel.gameExists as unknown as vi.Mock).mockResolvedValue(true);
    const dbGame = { id: 42, name: "Stored Game" };
    (gameModel.getGameById as unknown as vi.Mock).mockResolvedValue(dbGame);

    await getGameController(req, res);

    expect(gameModel.gameExists).toHaveBeenCalledWith(42);
    expect(gameModel.getGameById).toHaveBeenCalledWith(42);
    expect(res.json).toHaveBeenCalledWith({ source: "database", game: dbGame });
  });

  it("returns 404 when IGDB does not have the game", async () => {
    const { req, res } = makeReqRes();
    req.params.id = "100";

    (gameModel.gameExists as unknown as vi.Mock).mockResolvedValue(false);
    (igdbService.getGameDetails as unknown as vi.Mock).mockResolvedValue(
      undefined
    );

    await getGameController(req, res);

    expect(gameModel.gameExists).toHaveBeenCalledWith(100);
    expect(igdbService.getGameDetails).toHaveBeenCalledWith(100);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Game not found" });
  });

  it("fetches from IGDB, stores metadata and returns stored game", async () => {
    const { req, res } = makeReqRes();
    req.params.id = "7";

    (gameModel.gameExists as unknown as vi.Mock).mockResolvedValue(false);
    const igdbGame = { id: 7, name: "IGDB Game", raw: true };
    (igdbService.getGameDetails as unknown as vi.Mock).mockResolvedValue(
      igdbGame
    );

    const storedGame = { id: 7, name: "IGDB Game", formatted: true };
    (gameModel.storeGameMetadata as unknown as vi.Mock).mockResolvedValue(
      undefined
    );
    (gameModel.getGameById as unknown as vi.Mock).mockResolvedValue(storedGame);

    await getGameController(req, res);

    expect(gameModel.gameExists).toHaveBeenCalledWith(7);
    expect(igdbService.getGameDetails).toHaveBeenCalledWith(7);
    expect(gameModel.storeGameMetadata).toHaveBeenCalledWith(igdbGame);
    expect(gameModel.getGameById).toHaveBeenCalledWith(7);
    expect(res.json).toHaveBeenCalledWith({ source: "igdb", game: storedGame });
  });

  it("handles errors and responds with 500", async () => {
    const { req, res } = makeReqRes();
    req.params.id = "5";

    (gameModel.gameExists as unknown as vi.Mock).mockRejectedValue(
      new Error("db fail")
    );

    await getGameController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to get game details",
    });
  });
});
