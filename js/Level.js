/** @import GameEngine from "/js/GameEngine.js" */
import Interactable, { BedroomDoor, HouseDoor, StrawberryBush, Tree } from './Interactable.js';
import InGameClock from '/js/InGameClock.js';
import PottedPlant from '/js/PottedPlant.js';
import Teleporter from '/js/Teleporter.js';
import Oven, { Fryer } from "/js/Oven.js";
import PrepStation, { EmptyStation } from "/js/PrepStation.js";
import ChoppingStation from "/js/ChoppingStation.js";
import MixingStation from '/js/MixingStation.js';
import Customer from '/js/Customer.js';
import { CONSTANTS, randomIntRange, secondsToTicks } from '/js/Util.js';
import Button from '/js/AbstractClasses/Button.js';
import InventoryUI from '/js/InventoryUI.js';
import DialogueBox from '/js/GeneralUtils/DialogueBox.js';
import { getSave, wipeSave } from '/js/GeneralUtils/SaveDataRetrieval.js';
import MarketPlace from '/js/MarketPlace.js';
import { Basan } from '/js/MovingEntity.js';
import Player from './Player.js';
import StationPlaceholder from '/js/StationPlaceholder.js';
import CustomerManager from '/js/CustomerManager.js';
import Item from "/js/Item.js";
import MarketPlaceUI from '/js/MarketplaceUI.js';
import { getRecipeData } from '/js/DataClasses/RecipeList.js';
import StationIndicator from '/js/StationIndicator.js';
import { STEP_TYPE } from '/js/Constants/cookingStationStates.js';
import { createStationMap } from '/js/StationIndicator.js';
import Cursor from '/js/GeneralUtils/Cursor.js';
import FlyingEnemy from '/js/FlyingEnemy.js';
import TransitionScreen from '/js/TransitionScreen.js';

// size of a tile in screen pixels
const TILE_SIZE = 32;

// don't move the camera horizontally/vertically if the player hasn't moved this far from the middle.
const HORIZONTAL_FORGIVENESS = 1 * CONSTANTS.TILESIZE;
const VERTICAL_FORGIVENESS = 1 * CONSTANTS.TILESIZE;

// offset the camera by this much to center the player
const CAMERA_CENTER_X = CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE);
const CAMERA_CENTER_Y = CONSTANTS.CANVAS_HEIGHT / (1.75 * CONSTANTS.SCALE);  // edit the number to change the vertical position of the camera

const tileColors = [
    "#000000",
    "#774400",
    "#444444",
    "#b3874e",
    "#6aa84f",
    "#00000000"
];

const tileTextures = [
    "nothing",
    "/Assets/WorldTiles/WoodSheet.png",
    "/Assets/WorldTiles/StoneSheet.png",
    "/Assets/WorldTiles/BWoodSheet.png",
    "/Assets/WorldTiles/GrassSheet.png",
    "/Assets/WorldItems/Tree-Sheet.png",
    "nothing"
];

const BACKGROUND_ASSET_MORNING = "/Assets/WorldTiles/MorningBG.png"
const BACKGROUND_ASSET_AFTERNOON = "/Assets/WorldTiles/AfternoonBG.png"
const BACKGROUND_ASSET_SUNSET = "/Assets/WorldTiles/SunsetBG.png"
const BACKGROUND_ASSET_NIGHT = "/Assets/WorldTiles/NightBG.png"

const BACKGROUND_TIME_MORNING = secondsToTicks(82.5);
const BACKGROUND_TIME_AFTERNOON = secondsToTicks(135);
const BACKGROUND_TIME_SUNSET = secondsToTicks(150);
//24 tiles 0-8 are underground. 
const validTiles = [
    [80, 34],
    [86, 34],
    [82, 26],
    [84, 26],
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
    [48, 16]
]

const tree10Tiles = [
    [27, 14],
    [31, 14],
    [45, 14],
    [67, 14],
    [80, 14],
    [87, 14],
    [69, 0]
]

const tree11Tiles = [
    [34, 14],
    [83, 14],
    [94, 14],
    [71, 1],
    [29, 14],
    [51, 14]
]

const tree12TilesOut = [
    [10, 14],
    [36, 14],
    [38, 14],
    [49, 14],
    [55, 14],
    [78, 14],
    [89, 14],
    [92, 14],
    [66, 1]
]

const tree12TilesIn = [
    [45, 14]
]

const bushTiles = [
    [84, 16],
    [70, 16],
    [59, 16],
    [55, 16],
    [58, 4],
    [81, 2],
    [50, 16]
]

const monsterTiles = [
    [80, 1],
    [80, 10],
    [46, 4],
    [46, 4]
]

const wildItems = [
    3, //Potato
    4, //Rice
    19, //Onion
    6, //Cabbage
    8, //Boar Meat
    8, //Boat Meat (this is just for math.random shenanigans)
]

const level_data_debug = [
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
const level_data_inside = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
]

const level_data_outside = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 4, 1, 1, 0, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 3, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
	[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 4, 2, 2, 2, 2, 2, 0, 0, 4, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 4, 4, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 2, 4, 2, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 2, 2, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 2, 2, 4, 2, 2, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 2, 2, 4, 2, 4, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 2, 4, 2, 2, 2, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 4, 4, 2, 2, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 4, 2, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 4, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]


const menuButtonWidth = 3*TILE_SIZE;
const menuButtonHeight = 1*TILE_SIZE;
const centerX = CONSTANTS.CANVAS_WIDTH / (2 * CONSTANTS.SCALE)
const centerY = CONSTANTS.CANVAS_HEIGHT / (2 * CONSTANTS.SCALE);
const INTERACTABLE_OBJECT_LAYER = 3;
export default class LevelManager {
    /** @param {GameEngine} engine */
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
        this.BackgroundManager = new BackgroundManager(engine);
            this.engine.addEntity(this.BackgroundManager, 1)
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
            this.menuButtons = [];
        };

        const startLevelFunc = () => { //starts the level;
            that.menu = false;
            discardMenuUI();
            this.engine.setClock(new InGameClock(this.engine));
            const inventoryUI = new InventoryUI(this.player, ctx);
            // that.engine.inventoryUI = inventoryUI;
            that.engine.addUIEntity(inventoryUI);
            // COMMENT OUT THE REST OF THE LEVELS EXCEPT WHAT YOU WANT TO TELEPORT TO AT THE START
            that.teleport(3, 28, 15.5);
            // that.teleport(1, 2, 2);

            if (that.engine.getClock().dayCount <= 1) {
                that.engine.addUIEntity(new DialogueBox(that.engine, "You have to make $3000 by next week! Go to the front door and press 'E' to visit the marketplace to buy supplies for next week or gather ingredients outside to cook meals!"));
            }
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
        this.menuButtons = [];
    }

    pauseMenu() {
        this.discardMenuUI();
        const that = this;
        this.menuBttons = [];
        this.engine.getClock().stopTime(); // pause
        const discardMenuUI = () => {
            that.discardMenuUI();
            that.engine.getClock().resumeTime();
            that.menu = false;
        };
        const addMenuUIEntities = () => {
            that.addMenuUIEntities();
        }
        const goBackToMenu = () => {
            discardMenuUI();
            that.engine.getClock().stopTime();
            that.player.x = -50;
            that.player.y = -50;
            that.x = 0;
            that.y = 0;
            that.engine.entities.forEach(function (entitylist) {
                const entityLine = entitylist;
                if (entityLine) {
                    entityLine.forEach(function (entity) {
                        if (!entity instanceof Player ||!entity instanceof LevelManager || !entity instanceof Cursor || !entity instanceof BackgroundManager) {
                            entity.removeFromWorld = true;
                        } else if (entity instanceof InGameClock) {entity.removeFromWorld = true;}
                        else if (entity instanceof InventoryUI) {entity.removeFromWorld = true;}
                        else if (entity instanceof Tree) {entity.removeFromWorld = true;}
                    })
                }
            });
            this.menu = true;
            this.data = [];
            that.loadMainMenu();
        }
        const warning = () => {
            discardMenuUI();
            this.menu = true;
            that.engine.getClock().stopTime();
            that.menuButtons.push(new DialogueBox(that.engine, "If you leave to menu before the night ends, the progress for the day will not save. Go to menu?", true));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
            goBackToMenu, "Menu", "#81c2f3", "#040404"));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
            pauseMen, "Back", "#81c2f3", "#040404"));
            addMenuUIEntities();
        }
        const pauseMen = () => {
            discardMenuUI();
            this.menu = true;
            that.engine.getClock().stopTime();
            that.menuButtons.push(new DialogueBox(that.engine, "Currently Paused", true));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
            warning, "Menu", "#81c2f3", "#040404"));
            that.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
            discardMenuUI, "Back", "#81c2f3", "#040404"));
            addMenuUIEntities();
        }
        pauseMen();
        this.menu = true;
    }

    promptForNextDay() {
        this.discardMenuUI();
        const that = this;
        const discardMenuUI = () => {
            that.discardMenuUI();
            that.engine.getClock().resumeTime();
        };
        const fastForward = () => {
            that.discardMenuUI();
            that.engine.getClock().skipToNextDay();
            //that.engine.getClock().resumeTime();
        }
        this.menuButtons = [];
        this.menuButtons.push(new DialogueBox(this.engine, "Sleep to the next day? (saves the game)", true));
        this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
        fastForward, "Sleep", "#81c2f3", "#040404"));
        this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
        discardMenuUI, "Exit", "#81c2f3", "#040404"));
        this.engine.getClock().stopTime();
        this.addMenuUIEntities();
    }

    doorPrompt(door, isOutside) {
        this.discardMenuUI();
        const that = this;
        const discardMenuUI = () => {
            that.discardMenuUI();
            door.displaying = false;
            that.engine.getClock().resumeTime();
        };
        const goOutside = () => {
            that.discardMenuUI();
            that.engine.getClock().resumeTime();
            that.teleport(2, 8, 15.5)
            door.displaying = false;
        }
        const goInside = () => {
            that.discardMenuUI();
            door.displaying = false;
            if (!that.engine.getClock().isCookingMode) {
                //that.engine.getClock().resumeTime();
                that.engine.getClock().skipToCookingMode();
            } else {
                //console.log("attempted to go inside when already cooking mode")
                const transition = new TransitionScreen(that.engine, () => { hat.teleport(3, 40, 15.5); });
                //that.engine.getClock().resumeTime();
                that.engine.addUIEntity(transition);
            }
        }
        const openMarket = () => {
            that.discardMenuUI();
            const marketUI = new MarketPlaceUI(that.engine, door);
            that.engine.addUIEntity(marketUI);
            if (that.engine.getClock().dayCount <= 1) {
                that.engine.addUIEntity(new DialogueBox(that.engine, "I'll need some rice and flour to cook, but I need to buy a pot and some crops to plant for later..."))
            }
        }
        this.menuButtons = [];
        if (isOutside) {
            this.menuButtons.push(new DialogueBox(this.engine, "Go inside? (Skips to shop opening and you cannot go outside until the next day)", true));
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
                goInside, "Go Inside", "#81c2f3", "#040404"))
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
                discardMenuUI, "Exit", "#81c2f3", "#040404"))
        } else {
            this.menuButtons.push(new DialogueBox(this.engine, "Go outside? (You can't return or buy from the market until shop opens)", true));
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY, menuButtonWidth, menuButtonHeight,
            goOutside, "Go Outside", "#81c2f3", "#040404"));
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + menuButtonHeight + 5, menuButtonWidth, menuButtonHeight,
                openMarket, "Visit Market", "#81c2f3", "#040404"))
            this.menuButtons.push(new Button(centerX - (menuButtonWidth / 2), centerY + 2* (menuButtonHeight + 5), menuButtonWidth, menuButtonHeight,
                discardMenuUI, "Exit", "#81c2f3", "#040404"))
        }

        this.engine.getClock().stopTime();
        this.addMenuUIEntities();
    }

    //Initialize level 1;
    loadLevelDebug() {
        this.currentLevel = 1;
        // refresh scene entities
        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level_data_debug;

        this.sceneEntities = [];
        this.sceneEntities.push(new Interactable(4 * TILE_SIZE - (TILE_SIZE/2), 4 * TILE_SIZE - (TILE_SIZE/2), TILE_SIZE*2, TILE_SIZE*2, this.engine));
        this.sceneEntities.push(new Interactable(2 * TILE_SIZE - (TILE_SIZE/2), 8 * TILE_SIZE - (TILE_SIZE/2), TILE_SIZE*2, TILE_SIZE*2, this.engine));
        this.sceneEntities.push(new Teleporter(this.engine, 4*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1));
        this.sceneEntities.push(new Teleporter(this.engine, 7*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 2));
        this.sceneEntities.push(new Teleporter(this.engine, 10*TILE_SIZE, 8*TILE_SIZE, TILE_SIZE, TILE_SIZE, 3));
        this.sceneEntities.push(new PottedPlant(this.engine, 12 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE, false, this.engine.getClock().dayCount));
        this.sceneEntities.push(new PottedPlant(this.engine, 15 * TILE_SIZE, 8 * TILE_SIZE, TILE_SIZE, TILE_SIZE, false, this.engine.getClock().dayCount));

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
    loadLevelOutside() {
        this.currentLevel = 2;
        this.customerManager.setActive(false);

        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.sceneEntities = [];
        this.data = level_data_outside;
        const occupiedTiles = [];

        for (let j = 0; j < bushTiles.length; j++) {
            let amountOfValidBushes = 0;
            let randomInteger = randomIntRange(0, 10);
            if (randomInteger % 2 && amountOfValidBushes < 3) {
                this.sceneEntities.push(new StrawberryBush(this.engine, bushTiles[j][0] * TILE_SIZE, bushTiles[j][1] * TILE_SIZE, true));
                amountOfValidBushes++;
            } else {
                this.sceneEntities.push(new StrawberryBush(this.engine, bushTiles[j][0] * TILE_SIZE, bushTiles[j][1] * TILE_SIZE, false));
            }
            occupiedTiles.push(j);
        } 
        for(let i = 0; i < 3; i++) {
            var validSelection = 0;
            while (validSelection == 0) {
                var destTile = Math.floor(Math.random() * 23);
                if (!occupiedTiles.includes(destTile)) {
                    validSelection = 1;
                }
            }
            this.sceneEntities.push(new Item(wildItems[randomIntRange(2, 4)], validTiles[destTile][0] * TILE_SIZE + TILE_SIZE / 4, validTiles[destTile][1] * TILE_SIZE, 0, -4, Math.ceil(Math.random() * 3)));
            occupiedTiles.push(destTile); 
        }

        // get the save data and iterate through the entities, which are just pots for now.
        const save = getSave();
        const saveEntities = save.entities;
        const that = this;
        for (const key in saveEntities) {
            const obj = saveEntities[key];
            if (obj.level != 2) {
                continue;
            } else { // handle the objects for this level
                // handle if the objecct is a potted plant
                if (obj.type == "PottedPlant") {
                    this.sceneEntities.push(new PottedPlant(that.engine, obj.x, obj.y, obj.width, obj.height, obj.plant, obj.dayPlaced));
                }
            }
        }

        if (this.engine.getClock().dayCount <= 1) {
            this.engine.addUIEntity(new DialogueBox(this.engine, "If you have a pot, click on the pot icon in your inventory, then click again to" +
                "place it on the ground! Then take your plantable vegetable and press 'E' to place it on the pot, then just wait until it grows!"
            ));
            this.engine.getClock().stopTime();
            console.log("stopped time!")
        }


        const monsterTile = Math.floor(Math.random() * 3);
        this.sceneEntities.push(new Basan(this.engine, monsterTiles[monsterTile][0] * TILE_SIZE, monsterTiles[monsterTile][1] * TILE_SIZE));
        // this.sceneEntities.push(new Teleporter(this.engine, 16*TILE_SIZE, 16*TILE_SIZE, TILE_SIZE, TILE_SIZE, 1));
        this.sceneEntities.push(new HouseDoor(this.engine, 7*TILE_SIZE, 16*TILE_SIZE, true));

        this.sceneEntities.push(new FlyingEnemy(this.engine, 86*TILE_SIZE, 30*TILE_SIZE))

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity, INTERACTABLE_OBJECT_LAYER);
        })

        // add the trees after the scene entities adding
        for(let i = 0; i < tree10Tiles.length; i++){
            const Trees = new Tree(tree10Tiles[i][0] * TILE_SIZE, tree10Tiles[i][1]*TILE_SIZE, 1)
            this.engine.addEntity(Trees, 1)
            this.sceneEntities.push(Trees)
        }

        for(let i = 0; i < tree11Tiles.length; i++){
            const Trees = new Tree(tree11Tiles[i][0] * TILE_SIZE, tree11Tiles[i][1]*TILE_SIZE, 2)
            this.engine.addEntity(Trees, 1)
            this.sceneEntities.push(Trees)
        }

        for(let i = 0; i < tree12TilesOut.length; i++){
            const Trees = new Tree(tree12TilesOut[i][0] * TILE_SIZE, tree12TilesOut[i][1]*TILE_SIZE, 3)
            this.engine.addEntity(Trees, 1)
            this.sceneEntities.push(Trees)
        }
    }

    loadLevelInside() {
        this.currentLevel = 3;
        this.customerManager.setActive(true);
        const stationManager = this.engine.stationManager;

        if (this.engine.getClock().isCookingMode) {

            this.customerManager.reset();
            stationManager.resetAllStations();
            this.customerManager.setActive(true);
        } else {
            this.customerManager.setActive(false);
            stationManager.resetAllStations();
        }

        this.sceneEntities.forEach(function (entity) {
            entity.removeFromWorld = true;
        })
        this.data = level_data_inside;
        this.y = 0; // force camera to stop at bottom of level

        this.sceneEntities = [];
        //this.sceneEntities.push(new StationPlaceholder(this.engine, 25 * TILE_SIZE, 16*TILE_SIZE, TILE_SIZE,TILE_SIZE));

        // cooking station 1
        const prepStation1 = new PrepStation(17.5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("1"), this.engine);
        this.sceneEntities.push(new EmptyStation(18.5 * TILE_SIZE, 16 * TILE_SIZE))
        const fryStation1 = new Fryer(19.5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("1"), this.engine);
        this.sceneEntities.push(new EmptyStation(20.5 * TILE_SIZE, 16 * TILE_SIZE))
        const oven1 = new Oven(22 * TILE_SIZE - .5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("1"),this.engine);
        this.sceneEntities.push(new EmptyStation(22.5 * TILE_SIZE, 16 * TILE_SIZE))
        const choppingStation1 = new ChoppingStation(24 * TILE_SIZE - .5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("1"),this.engine);
        this.sceneEntities.push(new EmptyStation(24.5 * TILE_SIZE, 16 * TILE_SIZE))
        const mixingStation1 = new MixingStation(25.5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("1"),this.engine);

        // cooking station 2
        const prepStation2 = new PrepStation(30 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("2"), this.engine);
        this.sceneEntities.push(new EmptyStation(31 * TILE_SIZE, 16 * TILE_SIZE))
        const fryStation2 = new Fryer(32 * TILE_SIZE, 16 * TILE_SIZE- .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("2"), this.engine);
        this.sceneEntities.push(new EmptyStation(33 * TILE_SIZE, 16 * TILE_SIZE))
        const oven2 = new Oven(34.5 * TILE_SIZE - .5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("2"),this.engine);
        this.sceneEntities.push(new EmptyStation(35 * TILE_SIZE, 16 * TILE_SIZE))
        const choppingStation2 = new ChoppingStation(36.5 * TILE_SIZE - .5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("2"),this.engine);
        this.sceneEntities.push(new EmptyStation(37 * TILE_SIZE, 16 * TILE_SIZE))
        const mixingStation2 = new MixingStation(38.5 * TILE_SIZE - .5 * TILE_SIZE, 16 * TILE_SIZE - .5 * TILE_SIZE, TILE_SIZE, TILE_SIZE, stationManager.getStationById("2"),this.engine);

        const stationMap1 = createStationMap(prepStation1, oven1, choppingStation1, mixingStation1, fryStation1);
        const stationMap2 = createStationMap(prepStation2, oven2, choppingStation2, mixingStation2, fryStation2);
        const indicator1 = new StationIndicator(stationManager.getStationById("1"), stationMap1, this.engine);
        const indicator2 = new StationIndicator(stationManager.getStationById("2"), stationMap2, this.engine);
        this.sceneEntities.push(prepStation1);
        this.sceneEntities.push(fryStation1);
        this.sceneEntities.push(oven1);
        this.sceneEntities.push(choppingStation1);
        this.sceneEntities.push(mixingStation1);
        this.sceneEntities.push(indicator1);

        this.sceneEntities.push(prepStation2);
        this.sceneEntities.push(fryStation2)
        this.sceneEntities.push(oven2);
        this.sceneEntities.push(choppingStation2);
        this.sceneEntities.push(mixingStation2);
        this.sceneEntities.push(indicator2);

        this.sceneEntities.push(new BedroomDoor(28 * TILE_SIZE, 16*TILE_SIZE, this.engine));
        this.sceneEntities.push(new HouseDoor(this.engine, 42*TILE_SIZE, 16*TILE_SIZE, false));

        // for(let i = 0; i < tree12TilesIn.length; i++){
        //     this.sceneEntities.push(new Tree(tree12TilesIn[i][0] * TILE_SIZE, tree12TilesIn[i][1]*TILE_SIZE, 3));
        // }

        const engine = this.engine;
        this.sceneEntities.forEach(function (entity) {
            engine.addEntity(entity, INTERACTABLE_OBJECT_LAYER);
        })

        for(let i = 0; i < tree12TilesIn.length; i++){
            const Trees = new Tree(tree12TilesIn[i][0] * TILE_SIZE, tree12TilesIn[i][1]*TILE_SIZE, 3)
            this.engine.addEntity(Trees, 1)
            this.sceneEntities.push(Trees);
        }

        if (this.engine.getClock().isCookingMode && this.engine.getClock().dayCount <= 1) {
            this.engine.addUIEntity(new DialogueBox(this.engine, "Take orders from the customers before they walk out! Customers will ask for a dish with a specific ingredient, so go to a cooking station and make sure you use it while cooking. If you don't have the ingredients, press F to refuse their order, and someone else might take their spot!"));
            this.engine.getClock().stopTime();
        }
    }

    reloadClock() {
        const clock = this.engine.getClock();
        this.engine.setClock(new InGameClock(this.engine));
        this.engine.getClock().removeFromWorld = true;
        this.engine.setClock(clock);
    }

    teleport(level, x, y) { // use to initialize levels and player position
        if (level === 1) {
            this.loadLevelDebug();
        } else if (level === 2) {
            this.loadLevelOutside();
        } else if (level === 3) {
            this.loadLevelInside();
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
        if (this.menu) {
            return;
        }

        this.customerManager.update();
        // check for escape button and open a menu for it
        if (engine.input.escape) {
            this.pauseMenu();
        }
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
                let tileVal = this.getTile(x, y);
                if (tileVal !== 0 && tileVal != 3 && tileVal != 6 && !(tileVal >= 10 && tileVal <= 12)) {
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
        if(!this.data[0]) return;

        if (CONSTANTS.DEBUG) {
            ctx.strokeStyle = "#706ccd";
            ctx.strokeRect(
                (CAMERA_CENTER_X - HORIZONTAL_FORGIVENESS), (CAMERA_CENTER_Y - VERTICAL_FORGIVENESS),
                HORIZONTAL_FORGIVENESS * 2, VERTICAL_FORGIVENESS * 2)
            ctx.fillText(`${this.x} ${this.y}`, 0, 32)
        }

        // --- camera ---
        const worldCenterX = this.player.x + this.player.width / 2 - CAMERA_CENTER_X
        const worldCenterY = this.player.y + this.player.height / 2 - CAMERA_CENTER_Y
        const levelWidth = (this.data[0].length - 16) * CONSTANTS.TILESIZE
        const levelHeight = (this.data.length - 12) * CONSTANTS.TILESIZE

        // scroll right
        if(this.x < worldCenterX - HORIZONTAL_FORGIVENESS) {
            this.x = Math.min(worldCenterX - HORIZONTAL_FORGIVENESS, levelWidth)
        }
        // scroll left
        if(this.x > worldCenterX + HORIZONTAL_FORGIVENESS) {
            this.x = Math.max(worldCenterX + HORIZONTAL_FORGIVENESS, 0)
        }
        // scroll down
        if(this.y < worldCenterY - VERTICAL_FORGIVENESS) {
            this.y = Math.min(worldCenterY - VERTICAL_FORGIVENESS, levelHeight)
        }
        // scroll up
        if(this.y > worldCenterY + VERTICAL_FORGIVENESS) {
            this.y = Math.max(worldCenterY + VERTICAL_FORGIVENESS, 0)
        }

        // June note: We'll let background be a seperate entity
        // // --- background ---
        // const timeOfDay = engine.getClock();
        // if(this.currentLevel > 1){
        //     if(timeOfDay.dayTimeTicks < BACKGROUND_TIME_MORNING) {
        //         if(this.currentLevel == 3)
        //              ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_MORNING), 0, 0, 896, 288 - 8, 0 - this.x, 0 - this.y, 896 * 2, (288 - 8) * 2 );
        //         else if(this.currentLevel == 2)
        //             ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_MORNING), 0, 288, 1520, 576 - 8, 0 - this.x, 0 - this.y, 1520 * 2, (576 - 8) * 2 );
        //         }
        //     else if(timeOfDay.dayTimeTicks < BACKGROUND_TIME_AFTERNOON) {
        //         if(this.currentLevel == 3)
        //              ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_AFTERNOON), 0, 0, 896, 288 - 8, 0 - this.x, 0 - this.y, 896 * 2, (288 - 8) * 2 );
        //         else if(this.currentLevel == 2)
        //             ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_AFTERNOON), 0, 288, 1520, 576 - 8, 0 - this.x, 0 - this.y, 1520 * 2, (576 - 8) * 2 );
        //         }
        //     else if(timeOfDay.dayTimeTicks < BACKGROUND_TIME_SUNSET) {
        //         if(this.currentLevel == 3)
        //              ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_SUNSET), 0, 0, 896, 288 - 8, 0 - this.x, 0 - this.y, 896 * 2, (288 - 8) * 2 );
        //         else if(this.currentLevel == 2)
        //             ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_SUNSET), 0, 288, 1520, 576 - 8, 0 - this.x, 0 - this.y, 1520 * 2, (576 - 8) * 2 );
        //         }
        //     else {
        //         if(this.currentLevel == 3)
        //              ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_NIGHT), 0, 0, 896, 288 - 8, 0 - this.x, 0 - this.y, 896 * 2, (288 - 8) * 2 );
        //         else if(this.currentLevel == 2)
        //             ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_NIGHT), 0, 288, 1520, 576 - 8, 0 - this.x, 0 - this.y, 1520 * 2, (576 - 8) * 2 );
        //         }

        //     }

        // if(this.currentLevel == 3)
        //     ctx.drawImage(ASSET_MANAGER.getAsset("/Assets/WorldTiles/Backgrounds.png"), 0, 0, 896, 288 - 8, 0 - this.x, 0 - this.y, 896 * 2, (288 - 8) * 2 );
        // else if(this.currentLevel == 2)
        //     ctx.drawImage(ASSET_MANAGER.getAsset("/Assets/WorldTiles/Backgrounds.png"), 0, 287, 1520, 576 - 8, 0 - this.x, 0 - this.y, 1520 * 2, (576 - 8) * 2 );


        // --- draw tiles ---
        for (let row = Math.floor(this.y / TILE_SIZE); row < Math.ceil(this.y / TILE_SIZE) + 12; row++) {
            const rowData = data[row];
            if(!rowData) continue;
            const rowDataLength = rowData.length;

            for (let column = Math.floor(this.x / TILE_SIZE); column < Math.ceil(this.x / TILE_SIZE) + 16; column++) {
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
                    } //else if (tile >= 10 && tile < 15) {
                    //     const sprite = ASSET_MANAGER.getAsset(tileTextures[5]);
                    //     if (tile == 10) {
                    //         ctx.drawImage(sprite, 0, 0, 32, 48, column*TILE_SIZE - this.x, row*TILE_SIZE-this.y - (24*4) + 5, 32*4, 48*4)
                    //     }
                    //     if (tile == 11) {
                    //         ctx.drawImage(sprite, 32, 0, 32, 48, column*TILE_SIZE - this.x, row*TILE_SIZE-this.y - (24*4) + 5, 32*4, 48*4)
                    //     }
                    //     if (tile == 12) {
                    //         ctx.drawImage(sprite, 128, 0, 32, 48, column*TILE_SIZE - this.x, row*TILE_SIZE-this.y - (24*4) + 5, 32*4, 48*4)
                    //     }
                    // }
                else {
                    ctx.fillStyle = tileColors[tile];
                    ctx.fillRect(column * TILE_SIZE - this.x, row * TILE_SIZE - this.y, TILE_SIZE + 1, TILE_SIZE + 1);
                }
                }
            }
        }
    }
}

export class BackgroundManager {
    constructor(engine) {
        this.engine = engine;
    }

    update(engine) {
        // this.x = engine.camera.x;
        // this.y = engine.camera.y
    }
    draw(ctx, engine) {
        // --- camera ---
        const level = engine.getLevel();
        if(!level.data[0]) return;
        
        const worldCenterX = level.player.x + level.player.width / 2 - CAMERA_CENTER_X
        const worldCenterY = level.player.y + level.player.height / 2 - CAMERA_CENTER_Y
        const levelWidth = (level.data[0].length - 16) * CONSTANTS.TILESIZE
        const levelHeight = (level.data.length - 12) * CONSTANTS.TILESIZE

        // scroll right
        if(level.x < worldCenterX - HORIZONTAL_FORGIVENESS) {
            level.x = Math.min(worldCenterX - HORIZONTAL_FORGIVENESS, levelWidth)
        }
        // scroll left
        if(level.x > worldCenterX + HORIZONTAL_FORGIVENESS) {
            level.x = Math.max(worldCenterX + HORIZONTAL_FORGIVENESS, 0)
        }
        // scroll down
        if(level.y < worldCenterY - VERTICAL_FORGIVENESS) {
            level.y = Math.min(worldCenterY - VERTICAL_FORGIVENESS, levelHeight)
        }
        // scroll up
        if(level.y > worldCenterY + VERTICAL_FORGIVENESS) {
            level.y = Math.max(worldCenterY + VERTICAL_FORGIVENESS, 0)
        }
        // --- background ---
        const timeOfDay = engine.getClock();
        if(level.currentLevel > 1){
            if(timeOfDay.dayTimeTicks < BACKGROUND_TIME_MORNING) {
                if(level.currentLevel == 3)
                     ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_MORNING), 0, 0, 896, 288 - 8, 0 - level.x, 0 - level.y, 896 * 2, (288 - 8) * 2 );
                else if(level.currentLevel == 2)
                    ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_MORNING), 0, 288, 1520, 576 - 8, 0 - level.x, 0 - level.y, 1520 * 2, (576 - 8) * 2 );
                }
            else if(timeOfDay.dayTimeTicks < BACKGROUND_TIME_AFTERNOON) {
                if(level.currentLevel == 3)
                     ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_AFTERNOON), 0, 0, 896, 288 - 8, 0 - level.x, 0 - level.y, 896 * 2, (288 - 8) * 2 );
                else if(level.currentLevel == 2)
                    ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_AFTERNOON), 0, 288, 1520, 576 - 8, 0 - level.x, 0 - level.y, 1520 * 2, (576 - 8) * 2 );
                }
            else if(timeOfDay.dayTimeTicks < BACKGROUND_TIME_SUNSET) {
                if(level.currentLevel == 3)
                     ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_SUNSET), 0, 0, 896, 288 - 8, 0 - level.x, 0 - level.y, 896 * 2, (288 - 8) * 2 );
                else if(level.currentLevel == 2)
                    ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_SUNSET), 0, 288, 1520, 576 - 8, 0 - level.x, 0 - level.y, 1520 * 2, (576 - 8) * 2 );
                }
            else {
                if(level.currentLevel == 3)
                     ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_NIGHT), 0, 0, 896, 288 - 8, 0 - level.x, 0 - level.y, 896 * 2, (288 - 8) * 2 );
                else if(level.currentLevel == 2)
                    ctx.drawImage(ASSET_MANAGER.getAsset(BACKGROUND_ASSET_NIGHT), 0, 288, 1520, 576 - 8, 0 - level.x, 0 - level.y, 1520 * 2, (576 - 8) * 2 );
                }

            }

        if(level.currentLevel == 3)
            ctx.drawImage(ASSET_MANAGER.getAsset("/Assets/WorldTiles/Backgrounds.png"), 0, 0, 896, 288 - 8, 0 - level.x, 0 - level.y, 896 * 2, (288 - 8) * 2 );
        else if(level.currentLevel == 2)
            ctx.drawImage(ASSET_MANAGER.getAsset("/Assets/WorldTiles/Backgrounds.png"), 0, 287, 1520, 576 - 8, 0 - level.x, 0 - level.y, 1520 * 2, (576 - 8) * 2 );
    }
}