import GameEngine from "/js/GameEngine.js";
import AssetManager from "/js/AssetManager.js";
import Level from "/js/Level.js";
import Player from "/js/Player.js";
import CollisionTester from "/js/CollisionTester.js";
import InGameClock from "/js/InGameClock.js";
import InventoryUI from "/js/InventoryUI.js";
import { CONSTANTS } from "/js/Util.js";
import Cursor from "/js/GeneralUtils/Cursor.js";

const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

//download from player folder
ASSET_MANAGER.queueDownload("/Assets/Player/IdleRun-Sheet.png")
ASSET_MANAGER.queueDownload("/Assets/Player/Cursor-Sheet.png")
ASSET_MANAGER.queueDownload("/Assets/Player/BladeEffect-Sheet.png")

//download from the entities folder
ASSET_MANAGER.queueDownload("/Assets/Entities/Basan-Sheet.png")

//download from world items folder
ASSET_MANAGER.queueDownload("/Assets/WorldItems/grey-pot.png")
ASSET_MANAGER.queueDownload("/Assets/WorldItems/PotatoPlant-Sheet.png")

//download from world tiles folder
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/Wood_(placed).webp")
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/WoodSheet.png")
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/BWoodSheet.png")
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/StoneSheet.png")
ASSET_MANAGER.queueDownload("/Assets/WorldTiles/GrassSheet.png")

//download from icons folder
ASSET_MANAGER.queueDownload("/Assets/Icons/PotatoIcon.png")
ASSET_MANAGER.queueDownload("/Assets/Icons/Rice.png")
ASSET_MANAGER.queueDownload("/Assets/Icons/RiceBowl.png")
ASSET_MANAGER.queueDownload("/Assets/Icons/CabbageIcon.png")
ASSET_MANAGER.queueDownload("/Assets/Icons/Flour.png")
ASSET_MANAGER.queueDownload("/Assets/Icons/BoarMeat.png")
ASSET_MANAGER.queueDownload("/Assets/Icons/Coin.png")





/**
 * Explanation of layers:
 * if you call addEntity without passing the layer number, you'll be put into layer 4
 * layer 7 is for UI and is the max layer
 * layer 6 is for game-logic elements that may or may not have UI, like the clock.
 * layer 5 is for foreground elements
 * layer 4 is where most elements may be placed like the player
 * layer 3 can have different elements that we may want in front of background or level layer elements but behind the player.
 * layer 3 may have Enemies and Interactable objects here
 * The level manager and level is placed into layer 2
 * Layer 0-1 can be backgrounds
 */

ASSET_MANAGER.downloadAll(() => {
    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
    ctx.font = "12px monospace";
    ctx.scale(CONSTANTS.SCALE, CONSTANTS.SCALE);
    canvas.style.cursor = 'none';
    canvas.style.backgroundColor = "rgb(116, 127, 142)"
    gameEngine.init(ctx);

    const player = new Player(48, 32);

    gameEngine.setPlayer(player);
    gameEngine.setLevel(new Level(gameEngine));
    gameEngine.setCursor(new Cursor());
    // gameEngine.addEntity(new CollisionTester());
    // ctx.translate(-CONSTANTS.CANVAS_WIDTH / 4, 0)

    gameEngine.start();
});

// for accessing via the debug console
window.engine = gameEngine;
window.ASSET_MANAGER = ASSET_MANAGER;
