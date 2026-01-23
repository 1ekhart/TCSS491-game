import GameEngine from "/js/GameEngine.js";
import AssetManager from "/js/AssetManager.js";
import Level from "/js/Level.js";
import Player from "/js/Player.js";
import CollisionTester from "/js/CollisionTester.js";
import CropEntity from "./CropEntity.js";

const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

const tileData = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2]
];

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    gameEngine.init(ctx);

    // TODO: once the UI is implemented, the main menu or some manager class should be the first entity added
    // it will then spawn all the other entities as necessary
    gameEngine.setLevel(new Level(tileData));
    gameEngine.addEntity(new Player(48, 32));
    gameEngine.addEntity(new CollisionTester());
    gameEngine.addEntity(new CropEntity(2 * 32, 8 * 32));
    gameEngine.addEntity(new CropEntity(5 * 32, 8 * 32));

    gameEngine.start();
});

// for accessing via the debug console
window.engine = gameEngine;
window.ASSET_MANAGER = ASSET_MANAGER;
