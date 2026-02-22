/** @import GameEngine from "/js/GameEngine.js" */
import Interactable, { BedroomDoor, HouseDoor } from './Interactable.js';
import InGameClock from '/js/InGameClock.js';
import PottedPlant from '/js/PottedPlant.js';
import Teleporter from '/js/Teleporter.js';
import Oven from "/js/Oven.js";
import PrepStation from "/js/PrepStation.js";
import { CONSTANTS } from '/js/Util.js';
import Customer from '/js/Customer.js';
import { RECIPES } from '/js/Data/Recipes.js';
import Button from '/js/AbstractClasses/Button.js';
import InventoryUI from '/js/InventoryUI.js';
import DialogueBox from '/js/GeneralUtils/DialogueBox.js';
import { wipeSave } from '/js/GeneralUtils/SaveDataRetrieval.js';
import MarketPlace from '/js/MarketPlace.js';
import MovingEntity, { Basan } from '/js/MovingEntity.js';
import Player from './Player.js';
import StationPlaceholder from '/js/StationPlaceholder.js';
import CustomerManager from '/js/CustomerManager.js';
import Item from "/js/Item.js";
import MarketPlaceUI from '/js/MarketplaceUI.js';

// size of a tile in screen pixels
const TILE_SIZE = 32;

// sets the game to this hour (15:00)
const ResetHour = 15;

// don't move the camera horizontally/vertically if the player hasn't moved this far from the middle.
const HORIZONTAL_FORGIVENESS = 1 * CONSTANTS.TILESIZE;
const VERTICAL_FORGIVENESS = 1 * CONSTANTS.TILESIZE;

// offset the camera by this much to center the player
const CAMERA_OFFSET_X = CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE);
const CAMERA_OFFSET_Y = CONSTANTS.CANVAS_HEIGHT / (1.75 * CONSTANTS.SCALE);  // edit the number to change the vertical position of the camera

const tileColors = [
    "#000000",
    "#774400",
    "#444444",
    "#b3874e",
    "#6aa84f",
    "#00000000",
    "#b3874e",
];

const tileTextures = [
    "nothing",
    "/Assets/WorldTiles/WoodSheet.png",
    "/Assets/WorldTiles/StoneSheet.png",
    "/Assets/WorldTiles/BWoodSheet.png",
    "/Assets/WorldTiles/GrassSheet.png",
    "nothing",
    "/Assets/WorldTiles/Stool.png"
];

const validTiles = [
    [80, 34],
    [86, 34],
    [80, 26],
    [83, 26],
    [80, 20],
    [75, 20],
    [70, 25],
    [68, 27],
    [66, 34],
    [70, 16],
    [84, 16],
    [72, 10],
    [77, 10],
    [80, 2],
    [82, 2],
    [84, 2],
    [70, 2],
    [59, 4],
    [56, 4],
    [46, 5],
    [45, 5],
    [44, 5],
    [46, 16],
    [46, 20]
]

const monsterTiles = [
    [80, 33],
    [80, 1],
    [46, 4],
    [46, 4]
]

const wildItems = [
    3, //Potato
    4, //Rice
    6, //Cabbage
    8, //Boar Meat
    8, //Boat Meat (this is just for math.random shenanigans)
]

const level1 = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 2, 1, 0, 0, 0, 1, 1, 1, 1, 2, 1, 0, 0, 0],
    [2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
    [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]

const level2 = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]
const level3 = [
	[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 6, 0, 0, 0, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
]

const level4 = [
	[1, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 4, 1, 1, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 3, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
]


const menuButtonWidth = 3*TILE_SIZE;
const menuButtonHeight = 1*TILE_SIZE;
const centerX = CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE)
const centerY = CONSTANTS.CANVAS_HEIGHT / (2 * CONSTANTS.SCALE);
const INTERACTABLE_OBJECT_LAYER = 3;
export default class LevelManager {
    constructor(engine) {
        this.toggleCooldown = 1;
        engine.camera = this;
        this.engine = engine;
        this.elapsedTime = 0;
        this.sceneEntities =  [];
        this.menu = true;
        this.data = [];
        // initialize player data
        this.player = engine.getPlayer();
        this.player.x = -50;
        this.player.y = -50;
        this.x = 0;
        this.y = 0;
        this.loadMainMenu();
        //  keeps track of entities so we can load or destroy all of the entities in a particular scene.
        this.currentLevel = 1;
        this.customerSpots = [
            { x: 2 * TILE_SIZE, y: 15 * TILE_SIZE },
            { x: 6 * TILE_SIZE, y: 15 * TILE_SIZE }
        ];

        this.customerManager = new CustomerManager(this.engine, this.customerSpots);
    }

    loadMainMenu() {
        const canvas = document.getElementById("gameWorld");
        const ctx = canvas.getContext("2d");

        //initialize the button areas and the UI elements
        const menuButtonWidth = 3*TILE_SIZE;
        const menuButtonHeight = 1*TILE_SIZE;
        const centerX = CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE)
        const centerY = CONSTANTS.CANVAS_HEIGHT / (2 * CONSTANTS.SCALE);
        this.menuButtons = [];

        //initialize callback functions and other functions
        const that = this;
        const discardMenuUI = () => {
            that.menuButtons.forEach(function (entity) {
                entity.removeFromWorld = true;
            })
        };

        const startLevelFunc = () => { //starts the level;
            that.menu = false;
            discardMenuUI();
            this.engine.setClock(new InGameClock(this.engine));
            const inventoryUI = new InventoryUI(this.player, ctx);
            that.engine.inventoryUI = inventoryUI;
            that.engine.addUIEntity(inventoryUI);
            if (that.engine.getClock().dayCount <= 1) {
                that.engine.addUIEntity(new DialogueBox(that.engine, "You have to make $3000 by next week! Go to the front door and press 'E' to visit the marketplace to buy supplies for next week or gather ingredients outside to cook meals!"));
            }
            that.teleport(1, 2, 2);
        }

        const levelSelect = () => { // selets what save you want to pick, new or old
            discardMenuUI();
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
            startLevelFunc, "Load Game", "#81c2f3", "#040404"));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
            newGameWarning, "New Game", "#81c2f3", "#040404"))
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + 2* (menuButtonHeight + 5), menuButtonWidth, menuButtonHeight,
            startMenu, "Back", "#81c2f3", "#040404"))
            addMenuUIEntities();
        }

        const wipeSaveData = () => { // wipes the save and starts a new game
            wipeSave();
            that.player.removeFromWorld = true;
            const player = new Player(-50, -50);
            that.engine.setPlayer(player);
            that.player = player;
            startLevelFunc();
        }

        const newGameWarning = () => {
            discardMenuUI();
            that.menuButtons.push(new DialogueBox(that.engine, "If you have already saved data, this will be overwritten. Do you want to start a new game?", true));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
            wipeSaveData, "New Game", "#81c2f3", "#040404"));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
            levelSelect, "Back", "#81c2f3", "#040404"));
            addMenuUIEntities();
        }

        const howToPlay = () => {
            discardMenuUI();
            that.menuButtons.push(new DialogueBox(that.engine,
                `DEFAULT CONTROLS: A+D to move, Space to jump, E to interact with objects (usually gives a pop-up to interact), ` +
                `Mouse-Click to attack, you can click on the "B" icon to open the backpack, and you can select a slot on the backpack, and hold and drop to place it in other slots. `  +
                `HOW TO PLAY: By day you harvest crops, forage for ingredients, and kill enemies for meat. By night, you run a restaurant and serve customers to make money to buy more ` +
                `ingredients, and more pots that you can plant crops into. To cook a dish, select the ingredients specified on the recipe, and click on the highlighted recipe to cook. `, true, true));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), 2 * centerY - menuButtonHeight - 5, menuButtonWidth, menuButtonHeight,
            startMenu, "Back", "#81c2f3", "#040404"))

            addMenuUIEntities();
        }

        const startMenu = () => {
            discardMenuUI();
            this.menuButtons.push(new Button(centerX - (menuButtonWidth/2), centerY, menuButtonWidth, menuButtonHeight,
            levelSelect, "Start", "#81c2f3", "#040404"))
            this.menuButtons.push(new Button(centerX - (menuButtonWidth/2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
            howToPlay, "How To Play", "#81c2f3", "#040404"))
            addMenuUIEntities();
        }

        // this.engine.getClock().stopTime();
        // this.menuButtons.push(new InventoryUI(this.player, ctx));
        // this.menuButtons.push(new Button(centerX - (menuButtonWidth/2), centerY, menuButtonWidth, menuButtonHeight,
        //     levelSelect, "Start", "#81c2f3", "#040404"))
        const engine = this.engine;

        const addMenuUIEntities = () => {
            that.menuButtons.forEach(function (entity) {
            engine.addUIEntity(entity);
        })
        }
        startMenu();
    }

    addMenuUIEntities() {
        const that = this;
        this.menuButtons.forEach(function (entity) {
            that.engine.addUIEntity(entity);
        })
    }

    discardMenuUI() {
        this.menuButtons.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
    }

    promptForNextDay() {
        this.discardMenuUI();
        const that = this;
        const discardMenuUI = () => {
            that.discardMenuUI();
        };
        const fastForward = () => {
            that.engine.getClock().skipToNextDay();
        }
        this.menuButtons = [];
        this.menuButtons.push(new DialogueBox(this.engine, "Sleep to the next day? (saves the game)", true));
        this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
        fastForward, "Sleep", "#81c2f3", "#040404"));
        this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
        discardMenuUI, "Exit", "#81c2f3", "#040404"));
        this.addMenuUIEntities();
    }

    doorPrompt(door, isOutside) {
        this.discardMenuUI();
        const that = this;
        const discardMenuUI = () => {
            that.discardMenuUI();
            door.displaying = false;
        };
        const goOutside = () => {
            that.discardMenuUI();
            that.teleport(2, 10, 10)
            door.displaying = false;
        }
        const goInside = () => {
            that.discardMenuUI();
            if (!that.engine.getClock().isCookingMode) {
                that.engine.getClock().skipToCookingMode();
            } else {
                console.log("attempted to go inside when already cooking mode")
                that.teleport(3, 40, 14);
            }
            door.displaying = false;
        }
        const openMarket = () => {
            that.discardMenuUI();
            const cookingUI = new MarketPlaceUI(that.engine, door);
            that.engine.addUIEntity(cookingUI);
        }
        this.menuButtons = [];
        if (isOutside) {
            this.menuButtons.push(new DialogueBox(this.engine, "Go inside? (Skips to shop opening and you cannot go outside until the next day)", true));
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
                goInside, "Go Inside", "#81c2f3", "#040404"))
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
                discardMenuUI, "Exit", "#81c2f3", "#040404"))
        } else {
            this.menuButtons.push(new DialogueBox(this.engine, "Go outside? (You can't return until shop opens)", true));
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
            goOutside, "Go Outside", "#81c2f3", "#040404"));
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
                openMarket, "Visit Market", "#81c2f3", "#040404"))
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + 2* (menuButtonHeight + 5), menuButtonWidth, menuButtonHeight,
                discardMenuUI, "Exit", "#81c2f3", "#040404"))
        }


        this.addMenuUIEntities();
    }

    //Initialize level 1;
    loadLevel1() {
        this.currentLevel = 1;
        // refresh scene entities
        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level1;

        this.sceneEntities = [];
        this.sceneEntities.push(new Interactable(4 * TILE_SIZE - (TILE_SIZE/2), 4 * TILE_SIZE - (TILE_SIZE/2), TILE_SIZE*2, TILE_SIZE*2, this.engine));
        this.sceneEntities.push(new Interactable(2 * TILE_SIZE - (TILE_SIZE/2), 8 * TILE_SIZE - (TILE_SIZE/2), TILE_SIZE*2, TILE_SIZE*2, this.engine));
        this.sceneEntities.push(new Teleporter(this.engine, 4*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1));
        this.sceneEntities.push(new Teleporter(this.engine, 7*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 2));
        this.sceneEntities.push(new Teleporter(this.engine, 10*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 3));
        this.sceneEntities.push(new PottedPlant(this.engine, 12 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3, this.engine.getClock().dayCount));
        this.sceneEntities.push(new PottedPlant(this.engine, 15 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE, 3, this.engine.getClock().dayCount));

        //this.sceneEntities.push(new Customer(21 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE / 2, TILE_SIZE, testOrder, this.engine));
        //this.sceneEntities.push(new Customer(22 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE / 2, TILE_SIZE, testOrder, this.engine));

        this.sceneEntities.push(new MarketPlace(this.engine, 18 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE))
        // this.sceneEntities.push(new MovingEntity(this.engine, 15 * TILE_SIZE, 8 * TILE_SIZE));
        this.sceneEntities.push(new Basan(this.engine, 15 * TILE_SIZE, 6 * TILE_SIZE));
        this.sceneEntities.push(new StationPlaceholder(this.engine, 6*TILE_SIZE, 4*TILE_SIZE, TILE_SIZE, TILE_SIZE));

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity, INTERACTABLE_OBJECT_LAYER);
        })

        this.customerManager.setActive(false);
    }

    //Initialize level 2
    loadLevel2() {
        this.currentLevel = 2;
        this.customerManager.setActive(false);

        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.sceneEntities = [];
        this.data = level4;

        const occupiedTiles = [];
        for(let i = 0; i < 3; i++) {
            var validSelection = 0;
            while (validSelection == 0) {
                var destTile = Math.floor(Math.random() * 23);
                if (!occupiedTiles.includes(destTile)) {
                    validSelection = 1;
                }
            }
            this.sceneEntities.push(new Item(wildItems[2], validTiles[destTile][0] * TILE_SIZE + TILE_SIZE / 4, validTiles[destTile][1] * TILE_SIZE, 0, -4, Math.ceil(Math.random() * 3)));
            occupiedTiles.push(destTile);
        }
        const monsterTile = Math.floor(Math.random() * 3);
        this.sceneEntities.push(new Basan(this.engine, monsterTiles[monsterTile][0] * TILE_SIZE, monsterTiles[monsterTile][1] * TILE_SIZE));
        this.sceneEntities.push(new Teleporter(this.engine, 16*TILE_SIZE, 16*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1));
        this.sceneEntities.push(new HouseDoor(this.engine, 7*TILE_SIZE, 16*TILE_SIZE, true));

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity, INTERACTABLE_OBJECT_LAYER);
        })
    }

    loadLevel3() {
        this.currentLevel = 3;
        this.customerManager.setActive(true);
        if (this.engine.getClock().isCookingMode) {
            this.customerManager.setActive(true);
        } else {
            this.customerManager.setActive(false);
        }

        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level3;

        this.sceneEntities = [];
        this.sceneEntities.push(new StationPlaceholder(this.engine, 25 * TILE_SIZE, 16*TILE_SIZE, TILE_SIZE,TILE_SIZE));
        this.sceneEntities.push(new BedroomDoor(30 * TILE_SIZE, 16*TILE_SIZE, this.engine));
        this.sceneEntities.push(new HouseDoor(this.engine, 42*TILE_SIZE, 16*TILE_SIZE, false));

        if (this.engine.getClock().isCookingMode && this.engine.getClock().dayCount <= 1) {
            this.engine.addUIEntity(new DialogueBox(this.engine, "Take orders from the customers before they walk out! Customers will ask for a dish with a specific ingredient, so go to a cooking station and make sure you use it while cooking."));
        }

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity, INTERACTABLE_OBJECT_LAYER);
        })
    }

    reloadClock() {
        const clock = this.engine.getClock();
        this.engine.setClock(new InGameClock(this.engine));
        this.engine.getClock().removeFromWorld = true;
        this.engine.setClock(clock);
    }

    teleport(level, x, y) { // use to initialize levels and player position
        if (level === 1) {
            this.loadLevel1();
        } else if (level === 2) {
            this.loadLevel2();
        } else if (level === 3) {
            this.loadLevel3();
        }
        const that = this;
        var player;
        this.engine.entities[4].forEach(function (entity){
            if (that.player === entity) player = true;
        })
        if (!this.player) {
            this.engine.setPlayer(player);
        }
        this.player.x = x * TILE_SIZE;
        this.player.y = y * TILE_SIZE;
    }

    //Handling level transitions and player movement
    update(engine) {
        // update the camera to fit player coordinates and stay centered.
        if (this.menu) {
            return;
        }
        let relPlayerX = this.player.x + this.player.width / (2 * CONSTANTS.SCALE) - CAMERA_OFFSET_X;
        let relplayerY = this.player.y + this.player.height / (2 * CONSTANTS.SCALE) - CAMERA_OFFSET_Y;

        let leftOffsetX = relPlayerX - HORIZONTAL_FORGIVENESS;
        let rightOffsetX = relPlayerX + HORIZONTAL_FORGIVENESS;
        let topOffsetY = relplayerY - VERTICAL_FORGIVENESS;
        let lowOffsetY = relplayerY + VERTICAL_FORGIVENESS;

        if (this.x < leftOffsetX) {
            this.x = leftOffsetX;
        } else if (this.x > rightOffsetX) {
            this.x = rightOffsetX;
        }

        if (this.y < topOffsetY) {
            this.y = topOffsetY;
        } else if (this.y > lowOffsetY) {
            this.y = lowOffsetY;
        }

        this.customerManager.update();
    }

    getTile(tileX, tileY) {
        return this.data[tileY]?.[tileX];
    }

    checkIfBoxCollides(boxX, boxY, width, height) {
        // convert box position to tile coordinates (right shift by 5 is equivalent to floor divide by 32 (the TILE_SIZE))
        const left = boxX >> 5;
        const right = (boxX + width - 1) >> 5; // - 1 is so width/height are actual width in pixels (not off by 1)
        const top = boxY >> 5;
        const bottom = (boxY + height - 1) >> 5;

        // check all tiles that the box overlaps
        for (let x = left; x <= right; x++) {
            for (let y = top; y <= bottom; y++) {
                if (this.getTile(x, y) !== 0 && this.getTile(x,y) != 3 && this.getTile(x,y) != 6) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {GameEngine} engine
     */
    draw(ctx, engine) {
        const data = this.data;
        const dataLength = data.length;

        if (CONSTANTS.DEBUG) {
        ctx.strokeStyle = "#706ccd";
        ctx.strokeRect((CAMERA_OFFSET_X - HORIZONTAL_FORGIVENESS),
        (CAMERA_OFFSET_Y - VERTICAL_FORGIVENESS),
        HORIZONTAL_FORGIVENESS * 2, VERTICAL_FORGIVENESS * 2)
        }


        for (let row = 0; row < dataLength; row++) {
            const rowData = data[row];
            const rowDataLength = rowData.length;

            for (let column = Math.floor(this.player.x / TILE_SIZE) - 9; column < Math.ceil(this.player.x / TILE_SIZE) + 10; column++) {
                const tile = rowData[column];
                if (tile > 0) {
                    const asset = ASSET_MANAGER.getAsset(tileTextures[tile]);
                    // temporary box graphics for tiles WILL ITERATE THROUGH TILE 4 CODE ONCE EACH TILE HAS A SHEET
                    if (tile > 0 && tile <= 4) {
                        //If true then we use the top open pieces
                        if (row == 0 || data[row -1][column] == 0) {
                            if(column == 0 || data[row][column - 1] == 0 ) {
                                ctx.drawImage(asset, 0, 0, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            else {
                                ctx.drawImage(asset, 18, 0, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1)
                            }
                            if(column == rowDataLength - 1 || data[row][column + 1] == 0) {
                                ctx.drawImage(asset, 0, 18, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1)
                            }
                            else {
                                ctx.drawImage(asset, 18, 18, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1)
                            }
                        }
                        //Closed top pieces
                        else {
                            if(column == 0 || data[row][column -1] == 0) {
                                ctx.drawImage(asset, 36, 0, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            else {
                                ctx.drawImage(asset, 54, 0, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            if(column == rowDataLength - 1 || data[row][column + 1] == 0) {
                                ctx.drawImage(asset, 36, 18, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            else {
                                ctx.drawImage(asset, 54, 18, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                        }
                        //If true then we use the bottom open pieces
                        if (row == dataLength - 1 || data[row + 1][column] == 0) {
                            if(column == 0 || data[row][column - 1] == 0 ) {
                                ctx.drawImage(asset, 0, 36, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            else {
                                ctx.drawImage(asset, 18, 36, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1)
                            }
                            if(column == rowDataLength - 1  || data[row][column + 1] == 0) {
                                ctx.drawImage(asset, 0, 54, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1)
                            }
                            else {
                                ctx.drawImage(asset, 18, 54, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1)
                            }
                        }
                        //Closed bottom pieces
                        else {
                            if(column == 0 || data[row][column - 1] == 0) {
                                ctx.drawImage(asset, 36, 36, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            else {
                                ctx.drawImage(asset, 54, 36, 16, 16, column * TILE_SIZE - this.x, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            if(column == rowDataLength - 1 || data[row][column + 1] == 0) {
                                ctx.drawImage(asset, 36, 54, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y + 16,TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                            else {
                                ctx.drawImage(asset, 54, 54, 16, 16, column * TILE_SIZE - this.x + 16, row * TILE_SIZE - this.y + 16, TILE_SIZE/2 + 1, TILE_SIZE/2 + 1 )
                            }
                        }
                }
                else if (tile == 6) {
                    ctx.drawImage(asset, 0, 0, 32, 32, column * TILE_SIZE - this.x, row * TILE_SIZE + TILE_SIZE + 2 - this.y, TILE_SIZE, TILE_SIZE);
                }
                else {
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(column * TILE_SIZE - this.x, row * TILE_SIZE - this.y, TILE_SIZE + 1, TILE_SIZE + 1);
                }
                }
            }
        }
    }
}
