import { STATION_STATE } from "/js/Constants/cookingStationStates.js";
import CookingStation from "/js/CookingStation.js";

export default class CookingStationManager {
    constructor() {
        this.stations = [];
    }

    createStation(id) {
        const station = new CookingStation(id);
        this.stations.push(station);
        return station;
    }

    getAvailableStation() {
        return this.stations.find(s => s.state === STATION_STATE.IDLE);
    }

    getStationById(id) {
        return this.stations.find(s => s.id === id);
    }

    resetAllStations() {
        this.stations.forEach(station => station.reset());
        console.log("All cooking station have been reset.");
    }
}