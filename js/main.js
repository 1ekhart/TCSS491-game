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
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/Wood_(Placed).webp")
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/GrassSheet.png")



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

    gameEngine.setPlayer(player);
    gameEngine.setClock(new InGameClock())
    gameEngine.setLevel(new Level(gameEngine));
    gameEngine.inventoryUI = inventoryUI;
    gameEngine.addEntity(new CollisionTester());
    // ctx.translate(-CONSTANTS.CANVAS_WIDTH / 4, 0)

    gameEngine.start();
});

// for accessing via the debug console
window.engine = gameEngine;
window.ASSET_MANAGER = ASSET_MANAGER;
