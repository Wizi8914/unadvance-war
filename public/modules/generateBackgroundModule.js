import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const auth = getAuth();
const db = getDatabase();

const GAME_ID = getGameID();

const ROW_COUNT = 15;
const COL_COUNT = 20;

function getGameID() {
    return window.location.href.split("=")[1];
}

const IMAGE_CODE = {
    blue_city: "../../assets/image/blue/blue_city.png",
    blue_heli: "../../assets/image/blue/blue_heli.png",
    blue_inf: "../../assets/image/blue/blue_inf.png",
    blue_jeep: "../../assets/image/blue/blue_jeep.png",
    blue_lm: "../../assets/image/blue/blue_lm.png",
    blue_tank: "../../assets/image/blue/blue_tank.png",

    red_city: "../../assets/image/red/red_city.png",
    red_heli: "../../assets/image/red/red_heli.png",
    red_inf: "../../assets/image/red/red_inf.png",
    red_jeep: "../../assets/image/red/red_jeep.png",
    red_lm: "../../assets/image/red/red_lm.png",
    red_tank: "../../assets/image/red/red_tank.png",

    neutral_city: "../../assets/image/environment/neutral_city.png",

    forest1: "../../assets/image/environment/forest1.png",
    forest2: "../../assets/image/environment/forest2.png",
    forest3: "../../assets/image/environment/forest3.png",
    forest4: "../../assets/image/environment/forest4.png",
    grass: "../../assets/image/environment/grass.png",
    mountain: "../../assets/image/environment/mountain.png",

    road_d: "../../assets/image/road/road_d.png",
    road_dl: "../../assets/image/road/road_dl.png",
    road_dlr: "../../assets/image/road/road_dlr.png",
    road_dr: "../../assets/image/road/road_dr.png",
    road_l: "../../assets/image/road/road_l.png",
    road_lr: "../../assets/image/road/road_lr.png",
    road_r: "../../assets/image/road/road_r.png",
    road_u: "../../assets/image/road/road_u.png",
    road_ud: "../../assets/image/road/road_ud.png",
    road_udl: "../../assets/image/road/road_udl.png",
    road_udr: "../../assets/image/road/road_udr.png",
    road_ul: "../../assets/image/road/road_ul.png",
    road_ulr: "../../assets/image/road/road_ulr.png",
    road_ur: "../../assets/image/road/road_ur.png",

};

function generateMap(rows, cols) {
    const map = [];
    const environmentTiles = ["forest1", "forest2", "forest3", "forest4", "grass", "mountain"];
    const cityTile = "neutral_city";
    const roadTiles = {
        d: "road_d", dl: "road_dl", dlr: "road_dlr", dr: "road_dr",
        l: "road_l", lr: "road_lr", r: "road_r",
        u: "road_u", ud: "road_ud", udl: "road_udl", udr: "road_udr",
        ul: "road_ul", ulr: "road_ulr", ur: "road_ur"
    };

    // Initialize the map with environment tiles
    for (let row = 0; row < rows; row++) {
        map[row] = [];
        for (let col = 0; col < cols; col++) {
            const randomEnvTile = environmentTiles[Math.floor(Math.random() * environmentTiles.length)];
            map[row][col] = randomEnvTile;
        }
    }

    // Place cities randomly but sparsely
    const cityCount = Math.floor((rows * cols) / 30); // 1 city per ~30 tiles
    for (let i = 0; i < cityCount; i++) {
        let cityPlaced = false;
        while (!cityPlaced) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            if (map[randomRow][randomCol] !== cityTile) {
                map[randomRow][randomCol] = cityTile;
                cityPlaced = true;
            }
        }
    }


    return map;
}



const tiles = document.querySelectorAll(".game__board__cell");

function renderMap(map) {
    for (let row = 0; row < ROW_COUNT; row++) {
        for (let col = 0; col < COL_COUNT; col++) {
            tiles[row * COL_COUNT + col].setAttribute("data-type", map[row][col]);
            tiles[row * COL_COUNT + col].children[0].src = IMAGE_CODE[map[row][col]];
        }
    }

}

const map1 = [
    [ "mountain", "grass", "neutral_city", "forest3", "forest3", "road_ud", "forest4", "forest1", "grass", "forest2", "forest4", "forest2", "forest4", "grass", "grass", "forest2", "forest1", "forest2", "forest2", "grass"],
    [ "forest2", "forest2", "forest2", "forest3", "forest3", "road_ud", "forest4", "forest4", "forest4", "forest3", "forest3", "mountain", "grass", "mountain", "forest1", "forest2", "forest4", "grass", "grass", "forest3"],
    [ "mountain", "forest1", "mountain", "forest2", "forest3", "road_ud", "forest1", "grass", "forest4", "grass", "forest3", "forest4", "forest3", "forest2", "mountain", "mountain", "mountain", "grass", "forest4", "forest3"],
    [ "forest1", "grass", "forest2", "road_r", "road_lr", "road_udl", "mountain", "forest4", "forest3", "grass", "grass", "grass", "forest4", "mountain", "mountain", "grass", "forest4", "red_city", "forest2", "forest3"],
    [ "mountain", "forest3", "neutral_city", "grass", "forest1", "road_ud", "forest2", "forest1", "forest3", "forest4", "forest3", "mountain", "forest1", "forest1", "neutral_city", "forest2", "road_dr", "road_lr", "road_lr", "road_lr"],
    [ "forest1", "mountain", "forest2", "mountain", "forest3", "road_ud", "forest4", "forest2", "forest2", "forest4", "forest3", "forest3", "mountain", "forest3", "forest4", "forest4", "road_ud", "forest3", "forest4", "mountain"],
    [ "forest2", "grass", "grass", "forest4", "forest1", "road_udr", "road_lr", "road_lr", "road_lr", "road_dlr", "road_lr", "road_lr", "road_lr", "road_lr", "road_lr", "road_lr", "road_ulr", "road_lr", "road_lr", "road_lr"],
    [ "grass", "grass", "forest2", "forest2", "forest2", "road_ud", "forest1", "mountain", "mountain", "road_ud", "forest4", "mountain", "forest1", "mountain", "forest1", "forest4", "mountain", "forest1", "forest2", "forest4"],
    [ "forest2", "forest2", "forest4", "forest1", "forest3", "road_ud", "forest2", "forest4", "forest4", "road_ud", "forest2", "forest2", "forest2", "forest2", "forest3", "forest1", "mountain", "forest2", "forest1", "forest2"],
    [ "forest2", "forest3", "forest2", "forest1", "mountain", "road_ud", "grass", "neutral_city", "forest4", "road_ud", "forest3", "forest3", "forest2", "grass", "forest1", "forest1", "forest3", "neutral_city", "forest3", "mountain"],
    [ "mountain", "forest2", "forest2", "forest1", "forest1", "road_ud", "forest1", "forest4", "mountain", "road_ud", "forest2", "forest4", "mountain", "forest4", "mountain", "forest3", "forest1", "mountain", "forest3", "forest1"],
    [ "road_lr", "road_lr", "road_lr", "road_lr", "road_lr", "road_ulr", "road_lr", "road_lr", "road_lr", "road_udl", "neutral_city", "forest4", "mountain", "grass", "forest1", "grass", "grass", "grass", "mountain", "grass"],
    [ "forest1", "forest1", "mountain", "forest1", "grass", "mountain", "forest2", "forest4", "forest3", "road_ud", "forest1", "grass", "mountain", "forest2", "grass", "forest2", "mountain", "forest2", "mountain", "forest4"],
    [ "forest1", "forest2", "grass", "mountain", "forest3", "forest2", "blue_city", "forest1", "forest2", "road_ud", "mountain", "forest2", "forest1", "grass", "forest1", "mountain", "mountain", "forest1", "mountain", "mountain"],
    [ "neutral_city", "forest2", "forest4", "forest2", "forest3", "forest2", "grass", "mountain", "forest3", "road_ud", "forest1", "grass", "forest2", "forest1", "forest4", "forest4", "forest4", "forest4", "mountain", "forest3"]
]

const map2 = [
    ["forest4","grass","forest1","forest4","forest4","forest1","forest4","mountain","road_ud","forest2","neutral_city","forest1","forest2","mountain","road_ud","forest3","mountain","grass","forest2", "grass" ],
    ["grass","grass","forest3","mountain","forest3","forest1","forest2","forest1","road_ur","road_lr","road_lr","road_lr","road_lr","road_lr","road_udl","mountain","mountain","grass","forest3", "grass" ],
    ["forest2","mountain","grass","forest1","forest1","mountain","forest4","forest3","forest3","forest1","forest1","forest1","forest1","mountain","road_ud","forest4","forest2","forest3","forest3", "grass" ],
    ["forest1","grass","grass","forest3","road_d","forest1","forest4","forest3","forest4","mountain","neutral_city","forest3","red_city","forest3","road_ud","forest2","mountain","forest2","forest1", "forest3" ],
    ["forest4","forest3","forest4","forest4","road_ud","forest3","forest1","mountain","grass","neutral_city","forest3","forest3","forest1","mountain","road_ud","forest2","forest2","forest4","forest2", "forest3" ],
    ["forest3","forest2","grass","neutral_city","road_ud","forest2","mountain","grass","forest1","mountain","forest2","forest1","mountain","forest1","road_ud","forest2","grass","mountain","forest4", "neutral_city" ],
    ["forest1","forest3","mountain","forest2","road_ud","forest2","mountain","forest4","forest2","forest1","forest2","forest3","forest2","grass","road_ud","forest1","forest4","forest2","neutral_city", "mountain" ],
    ["road_lr","road_lr","road_lr","road_lr","road_ulr","road_lr","road_lr","road_lr","road_lr","road_lr","road_lr","road_dlr","road_lr","road_lr","road_ulr","road_lr","road_lr","road_dlr","road_lr", "road_lr" ],
    ["forest2","forest4","forest4","mountain","forest4","forest2","forest1","forest3","forest1","forest4","forest3","road_ud","forest2","mountain","forest2","mountain","forest3","road_ud","forest3", "forest4" ],
    ["forest2","grass","forest4","mountain","mountain","forest3","forest4","forest3","forest2","grass","grass","road_ud","forest2","forest3","mountain","forest4","forest4","road_ud","mountain", "grass" ],
    ["forest3","forest2","grass","mountain","grass","forest2","forest4","forest1","grass","grass","grass","road_u","grass","forest1","forest2","forest3","forest4","road_ud","forest2", "forest3" ],
    ["mountain","forest2","forest4","forest2","grass","mountain","blue_city","forest1","grass","forest3","forest3","forest1","mountain","forest4","grass","forest3","forest1","road_ud","forest1", "forest2" ],
    ["forest4","forest1","forest4","forest3","forest2","forest1","forest3","forest4","forest3","forest4","forest2","forest4","grass","forest4","mountain","mountain","mountain","road_ud","forest4", "grass" ],
    ["forest2","forest4","forest1","forest2","grass","forest3","forest2","grass","mountain","forest1","neutral_city","forest4","forest3","forest4","forest2","mountain","grass","road_ud","forest2", "grass" ],
    ["mountain","forest1","mountain","forest2","forest4","mountain","mountain","mountain","forest3","forest3","mountain","mountain","forest1","forest2","grass","forest4","grass","road_ud","forest1","forest2"]
]


const map3 = [
    ["forest3","forest4","forest2","forest4","forest2","forest1","forest3","forest1","grass","mountain","mountain","forest4","neutral_city","forest1","forest4","road_ud","forest3","forest3","forest2","mountain"],
    ["forest4","mountain","forest3","mountain","forest1","mountain","forest2","mountain","grass","forest4","forest1","forest1","forest1","forest3","grass","road_ud","grass","mountain","forest3","forest4"],
    ["forest4","forest3","forest1","grass","grass","forest1","forest1","forest3","mountain","grass","forest4","blue_city","forest3","mountain","forest2","road_ud","forest3","forest4","mountain","neutral_city"],
    ["grass","forest1","grass","forest2","forest4","grass","forest4","forest4","forest4","forest3","forest3","forest2","forest4","forest4","grass","road_udr","road_lr","road_lr","road_lr","road_lr"],
    ["forest2","grass","forest4","forest4","grass","forest3","forest1","grass","grass","neutral_city","forest4","forest3","forest4","forest2","forest1","road_ud","grass","mountain","forest1","grass"],
    ["road_lr","road_lr","road_lr","road_lr","road_dlr","road_lr","road_lr","road_lr","road_lr","road_lr","road_dl","forest2","grass","mountain","forest2","road_ud","forest2","forest3","forest4","grass"],
    ["forest4","forest1","mountain","forest1","road_ud","grass","forest2","forest4","forest2","forest1","road_ud","forest2","mountain","mountain","forest4","road_ud","neutral_city","grass","forest2","mountain"],
    ["mountain","mountain","forest3","neutral_city","road_ud","forest2","forest3","forest3","forest4","forest3","road_ud","forest4","forest2","forest2","forest2","road_ud","forest2","forest1","grass","mountain"],
    ["forest4","forest3","forest4","forest2","road_ud","forest4","forest1","mountain","forest4","mountain","road_ur","road_lr","road_lr","road_lr","road_lr","road_ulr","road_lr","road_lr","road_lr","road_lr"],
    ["forest2","forest1","mountain","forest2","road_ud","forest1","forest1","forest4","mountain","forest1","mountain","forest4","forest4","forest2","forest2","forest3","forest4","forest4","forest4","forest2"],
    ["forest2","forest3","mountain","grass","road_ud","forest3","grass","forest2","forest2","forest3","neutral_city","forest2","grass","forest1","grass","forest4","forest2","forest4","mountain","forest3"],
    ["forest1","grass","forest4","mountain","road_ud","forest2","mountain","forest4","grass","grass","forest1","forest1","forest2","forest1","forest3","grass","grass","forest4","forest1","mountain"],
    ["forest1","red_city","forest2","neutral_city","road_ud","forest2","forest1","forest4","mountain","mountain","forest2","forest3","forest3","forest1","mountain","forest2","neutral_city","forest2","mountain","forest1"],
    ["mountain","forest1","forest2","mountain","road_ud","forest4","forest2","forest2","forest2","grass","forest3","forest4","forest4","forest4","forest2","forest3","forest3","forest3","forest4","forest2"],
    ["forest4","forest1","forest4","mountain","road_ud","grass","grass","forest4","grass","mountain","forest1","forest1","forest1","forest3","mountain","grass","mountain","forest3","forest4","forest2"]
]

renderMap(map3);

//renderMap(generateMap(ROW_COUNT, COL_COUNT));


