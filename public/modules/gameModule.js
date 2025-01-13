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

const tiles = document.querySelectorAll(".game__board__cell");

function renderMap(map) {
    for (let row = 0; row < ROW_COUNT; row++) {
        for (let col = 0; col < COL_COUNT; col++) {
            tiles[row * COL_COUNT + col].setAttribute("data-type", map[row][col]);
            tiles[row * COL_COUNT + col].children[0].src = IMAGE_CODE[map[row][col]];
        }
    }
}

get(ref(db, `games/${GAME_ID}`))
    .then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            // Get the map data
            get(ref(db, `maps/map_${data.mapType}`))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const mapData = snapshot.val();

                        renderMap(mapData.map);
                    } else {
                        alert("No map found");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
            
        } else {
            alert("No data found");
        }
    })