import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const auth = getAuth();
const db = getDatabase();

const GAME_ID = getGameID();

const ROW_COUNT = 15;
const COL_COUNT = 20;

let PLAYER_1_MONEY;
let PLAYER_2_MONEY;
let PLAYER_TURN;

let PAWN_MAP = Array.from({ length: ROW_COUNT }, () => Array(COL_COUNT).fill(""));

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

const units = {
    inf: {
        price: 50,
        health: 10,
        range: 1,
        power: {
            infanterie: 6,
            jeep: 6,
            tank: 3,
            helicoptere: 2
        }
    },
    jeep: {
        price: 100,
        health: 20,
        range: 2,
        power: {
            infanterie: 6,
            jeep: 6,
            tank: 3,
            helicoptere: 10
        }
    },
    tank: {
        price: 200,
        health: 50,
        range: 1,
        power: {
            infanterie: 2,
            jeep: 8,
            tank: 8,
            helicoptere: 2
        }
    },
    lm: {
        price: 300,
        health: 30,
        range: 1,
        power: {
            infanterie: 8,
            jeep: 10,
            tank: 15,
            helicoptere: 10
        }
    },
    heli: {
        price: 300,
        health: 20,
        range: 2,
        power: {
            infanterie: 8,
            jeep: 12,
            tank: 15,
            helicoptere: 1
        }
    }
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

function renderUnitMap() {
    console.log(PAWN_MAP);

    for (let row = 0; row < ROW_COUNT; row++) {
        for (let col = 0; col < COL_COUNT; col++) {
            if (typeof PAWN_MAP[row][col] == "object") {

                spawnUnit(PAWN_MAP[row][col].type, row, col, PAWN_MAP[row][col].health);
            }
        }
    }
}

function renderCity() {
    for (let row = 0; row < ROW_COUNT; row++) {
        for (let col = 0; col < COL_COUNT; col++) {
            if (PAWN_MAP[row][col] == "red_city") {
                tiles[row * COL_COUNT + col].children[0].src = IMAGE_CODE["red_city"];
            } else if (PAWN_MAP[row][col] == "blue_city") {
                tiles[row * COL_COUNT + col].children[0].src = IMAGE_CODE["blue_city"];
            }
        }
    }
}

function spawnUnit(unitType, row, col, health = 0) {
    const unit = document.createElement("img");
    unit.src = IMAGE_CODE[unitType];
    unit.classList.add("pawn");
    unit.setAttribute("data-type", unitType);

    tiles[row * COL_COUNT + col].appendChild(unit);

    PAWN_MAP[row][col] = { type: unitType, health: health == 0 ? units[unitType.split("_")[1]].health : health, enable: true };

    unit.addEventListener("click", (event) => {
        if (unitType.split("_")[0] != PLAYER_TURN) return;

        moveUnit(col, row, units[unitType.split("_")[1]].range, unitType.split("_")[1] == "heli");

    }, { once: true });
}


function moveUnit(column, row, range, canFly = false) {
    tiles.forEach(cell => {
        cell.classList.add('disabled');
    });
    
    for (let i = -range; i <= range; i++) {
            for (let j = -range; j <= range; j++) {
                const newRow = row + i;
                const newCol = column + j;
                if (newRow >= 0 && newRow < ROW_COUNT && newCol >= 0 && newCol < COL_COUNT) {
                    const cellIndex = newRow * COL_COUNT + newCol;

                    if (!canFly && tiles[cellIndex].getAttribute("data-type").includes("mountain")) continue; 

                    if (tiles[cellIndex].children.length == 2) {
                        if (tiles[cellIndex].children[1].getAttribute("data-type").split("_")[0] == PLAYER_TURN) continue;
                    };

                    tiles[cellIndex].classList.remove('disabled');
                    tiles[cellIndex].style.cursor = "pointer";

                    tiles[cellIndex].addEventListener("click", () => {
                        if (!PAWN_MAP[row][column].enable) return;
                        
                        // Player attack
                        if (tiles[cellIndex].children.length == 2) {
                            if (tiles[cellIndex].children[1].getAttribute("data-type").split("_")[0] == PLAYER_TURN) return;

                            // remove the health of the attacked unit
                            PAWN_MAP[newRow][newCol].health -= units[PAWN_MAP[row][column].type.split("_")[1]].power[tiles[cellIndex].children[1].getAttribute("data-type").split("_")[1]]

                            if (PAWN_MAP[newRow][newCol].health <= 0) {
                                tiles[cellIndex].removeChild(tiles[cellIndex].children[1]);
                                PAWN_MAP[newRow][newCol] = "";
                            }

                            PAWN_MAP[row][column].enable = false;

                        // PLayer take the city
                        } else if (tiles[cellIndex].getAttribute("data-type").includes("city") && tiles[cellIndex].getAttribute("data-type").split("_")[0] != PLAYER_TURN) {

                            tiles[cellIndex].children[0].src = IMAGE_CODE[`${PLAYER_TURN}_city`];
                            tiles[cellIndex].setAttribute("data-type", `${PLAYER_TURN}_city`);
                            PAWN_MAP[newRow][newCol] = `${PLAYER_TURN}_city`;

                            PAWN_MAP[row][column].enable = false;



                            openShop(cellIndex);
                            
                        // PLayer move
                        } else {
                            console.log(PAWN_MAP[row][column])
                            PAWN_MAP[row][column].enable = false;

                            const unit = tiles[row * COL_COUNT + column].children[1];
                            tiles[newRow * COL_COUNT + newCol].appendChild(unit);
                            tiles[newRow * COL_COUNT + newCol].classList.add('disabled');

                            PAWN_MAP[newRow][newCol] = PAWN_MAP[row][column];
                            PAWN_MAP[row][column] = "";
                        }


                        tiles.forEach((cell, index) => {
                            cell.classList.remove('disabled');
                            cell.style.cursor = "default";

                            cell.removeEventListener("click", () => {});

                            if (cell.children.length == 2) {
                                if (cell.children[1].getAttribute("data-type").split("_")[0] == PLAYER_TURN && !PAWN_MAP[Math.floor(index / COL_COUNT)][index % COL_COUNT].enable) {
                                    cell.classList.add('disabled');

                                }
                            }
                        });

                        set(ref(db, `games/${GAME_ID}/pawnMap`), PAWN_MAP);
                    }, { once: true });
                }
            }
        }
  }


function initializeMap() {
    get(ref(db, `games/${GAME_ID}`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();

                if (data.pawnMap == 0) {
                    tiles.forEach((tile, index) => {
                        let type = tile.getAttribute("data-type");


                        switch (type) {
                            case "red_city":
                                PAWN_MAP[Math.floor(index / COL_COUNT)][index % COL_COUNT] = type;
                                spawnUnit("red_inf", Math.floor(index / COL_COUNT) + 1, index % COL_COUNT);
                                spawnUnit("red_inf", Math.floor(index / COL_COUNT), index % COL_COUNT + 1);
                                

                                break;
                            case "blue_city":
                                PAWN_MAP[Math.floor(index / COL_COUNT)][index % COL_COUNT] = type;
                                spawnUnit("blue_inf", Math.floor(index / COL_COUNT) - 1, index % COL_COUNT);
                                spawnUnit("blue_inf", Math.floor(index / COL_COUNT), index % COL_COUNT - 1);
                                break;

                            case "neutral_city":
                                PAWN_MAP[Math.floor(index / COL_COUNT)][index % COL_COUNT] = type;

                                break;
                        }
                    });

                    set(ref(db, `games/${GAME_ID}/pawnMap`), PAWN_MAP);

                } else {
                    PAWN_MAP = data.pawnMap;

                    //spawnUnit("red_tank", 14, 4);

                    renderUnitMap();
                    renderCity();
                }
            }
        });
}

function updateMoney() {
    const player1Money = document.getElementById("player1-money");
    const player2Money = document.getElementById("player2-money");

    player1Money.textContent = PLAYER_1_MONEY + " $";
    player2Money.textContent = PLAYER_2_MONEY + " $";

    set(ref(db, `games/${GAME_ID}/player1Money`), PLAYER_1_MONEY);
    set(ref(db, `games/${GAME_ID}/player2Money`), PLAYER_2_MONEY);
}

function openShop(tileIndex) {
    const shop = document.querySelector(".shop");
    shop.style.display = "block";

    const shopNext = document.querySelector(".shop_next");
    const shopPrevious = document.querySelector(".shop_previous");
    const shopClose = document.querySelector(".shop_close");
    const shopBuy = document.querySelector(".shop_buy");

    const displayName = document.querySelector(".shop__container__item--name");
    const displayImage = document.querySelector(".shop__container__item--image");
    const displayPrice = document.querySelector(".shop__container__item--price");

    
    displayName.textContent = "inf";
    displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_inf`]
    displayPrice.textContent = units["inf"].price + " $";


    if (PLAYER_TURN == "red") {
        if (PLAYER_1_MONEY < units[displayName.textContent].price) {
            shopBuy.classList.add("disabled");
        }
    }
    
    if (PLAYER_TURN == "blue") {
        if (PLAYER_2_MONEY < units[displayName.textContent].price) {
            shopBuy.classList.add("disabled");
        }
    }

    shopNext.addEventListener("click", () => {
        if (PLAYER_TURN == "red") {
            if (PLAYER_1_MONEY < units["inf"].price) {
                shopBuy.classList.add("disabled");
            }
        }
    
        if (PLAYER_TURN == "blue") {
            if (PLAYER_2_MONEY < units["inf"].price) {
                shopBuy.classList.add("disabled");
            }
        }

        switch (displayName.textContent) {
            case "inf":
                displayName.textContent = "jeep";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_jeep`]
                displayPrice.textContent = units["jeep"].price + " $";
                break;
            case "jeep":
                displayName.textContent = "tank";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_tank`]
                displayPrice.textContent = units["tank"].price + " $";
                break;
            case "tank":
                displayName.textContent = "lm";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_lm`]
                displayPrice.textContent = units["lm"].price + " $";
                break;
            case "lm":
                displayName.textContent = "heli";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_heli`]
                displayPrice.textContent = units["heli"].price + " $";
                break;
            case "heli":
                displayName.textContent = "inf";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_inf`]
                displayPrice.textContent = units["inf"].price + " $";
                break;
        }
    });

    shopPrevious.addEventListener("click", () => {
        
        if (PLAYER_TURN == "red") {
            if (PLAYER_1_MONEY < units[displayName.textContent].price) {
                shopBuy.classList.add("disabled");
            }
        }
        
        if (PLAYER_TURN == "blue") {
            if (PLAYER_2_MONEY < units[displayName.textContent].price) {
                shopBuy.classList.add("disabled");
            }
        }

        switch (displayName.textContent) {
            case "inf":
                displayName.textContent = "heli";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_heli`]
                displayPrice.textContent = units["heli"].price + " $";
                break;
            case "jeep":
                displayName.textContent = "inf";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_inf`]
                displayPrice.textContent = units["inf"].price + " $";
                break;
            case "tank":
                displayName.textContent = "jeep";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_jeep`]
                displayPrice.textContent = units["jeep"].price + " $";
                break;
            case "lm":
                displayName.textContent = "tank";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_tank`]
                displayPrice.textContent = units["tank"].price + " $";
                break;
            case "heli":
                displayName.textContent = "lm";
                displayImage.src = IMAGE_CODE[`${PLAYER_TURN}_lm`]
                displayPrice.textContent = units["lm"].price + " $";
                break;
        }
    })

    shopClose.addEventListener("click", () => {
        shop.style.display = "none";
    });

    shopBuy.addEventListener("click", () => {
        //if (shopBuy.classList.contains("disabled")) return;
        spawnUnit(`${PLAYER_TURN}_${displayName.textContent}`, Math.floor(tileIndex / COL_COUNT), tileIndex % COL_COUNT);

        if (PLAYER_TURN == "red") {
            PLAYER_1_MONEY -= units[displayName.textContent].price;
        }

        if (PLAYER_TURN == "blue") {
            PLAYER_2_MONEY -= units[displayName.textContent].price;
        }

        updateMoney();

        shop.style.display = "none";

        set(ref(db, `games/${GAME_ID}/pawnMap`), PAWN_MAP);

    });
}

function enableAllUnits() {
    PAWN_MAP.forEach(row => {
        row.forEach(cell => {
            if (typeof cell == "object") {
                cell.enable = true;
            }
        });
    });
}

const playerTurnDisplay = document.querySelector(".player-turn");

function displayPlayerTurn() {
    playerTurnDisplay.textContent = PLAYER_TURN == "red" ? "Player turn : Red" : "Player turn : Blue";  
}

const passTurn = document.querySelector(".button_pass");

passTurn.addEventListener("click", () => {
    PLAYER_TURN = PLAYER_TURN == "red" ? "blue" : "red";

    displayPlayerTurn();

    set(ref(db, `games/${GAME_ID}/playerTurn`), PLAYER_TURN);
    enableAllUnits();
});



get(ref(db, `games/${GAME_ID}`))
    .then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();

            PLAYER_TURN = data.playerTurn;
            displayPlayerTurn();

            PLAYER_1_MONEY = data.player1Money;
            PLAYER_2_MONEY = data.player2Money;


            // Get the map data
            get(ref(db, `maps/map_${data.mapType}`))
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const mapData = snapshot.val();

                        renderMap(mapData.map);
                        initializeMap();
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




