import GameEngine from "/js/GameEngine.js";
import AssetManager from "/js/AssetManager.js";
import Level from "/js/Level.js";
import Player from "/js/Player.js";
import CollisionTester from "/js/CollisionTester.js";
import InGameClock from "/js/InGameClock.js";
import InventoryUI from "/js/InventoryUI.js";
import { CONSTANTS } from "/js/Util.js";

const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("/Assets/Player/IdleRun-Sheet.png")
ASSET_MANAGER.queueDownload("/Assets/WorldItems/grey-pot.png")
ASSET_MANAGER.queueDownload("/Assets/WorldItems/PotatoPlant-Sheet.png")


ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
    ctx.font = "12px monospace";
    ctx.scale(CONSTANTS.SCALE, CONSTANTS.SCALE);
    // ctx.translate(CONSTANTS.CANVAS_WIDTH / 4, 0)
    gameEngine.init(ctx);

    const player = new Player(48, 32);
    const inventoryUI = new InventoryUI(player, ctx);
    const tileSize = CONSTANTS.TILESIZE;

    // TODO: once the UI is implemented, the main menu or some manager class should be the first entity added
    // it will then spawn all the other entities as necessary
    gameEngine.setPlayer(player);
    gameEngine.setClock(new InGameClock())
    gameEngine.setLevel(new Level(gameEngine));
    gameEngine.inventoryUI = inventoryUI;
    gameEngine.addEntity(new CollisionTester());
    // gameEngine.addEntity(new CropEntity(2 * 32, 8 * 32));
    // gameEngine.addEntity(new CropEntity(5 * 32, 8 * 32));
    // gameEngine.addEntity(new Interactable(4 * 32 - 16, 4 * 32 - 16, 64, 64, gameEngine));
    // gameEngine.addEntity(new Interactable(1 * 32 - 16, 8 * 32 - 16, 64, 64, gameEngine));
    // gameEngine.addEntity(new Teleporter(gameEngine, 4*tileSize, 8*tileSize, tileSize, tileSize, 1))
    // gameEngine.addEntity(new Teleporter(gameEngine, 7*tileSize, 8*tileSize, tileSize, tileSize, 2))
    // ctx.translate(-CONSTANTS.CANVAS_WIDTH / 4, 0)

    gameEngine.start();
});

// for accessing via the debug console
window.engine = gameEngine;
window.ASSET_MANAGER = ASSET_MANAGER;
