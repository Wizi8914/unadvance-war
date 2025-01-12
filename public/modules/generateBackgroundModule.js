import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const auth = getAuth();
const db = getDatabase();

const GAME_ID = getGameID();

const tilesArrayImg = [["blue"]] 

function getGameID() {
    return window.location.href.split("=")[1];
}

const IMAGE_CODE = {
    blue_city: "../../assets/image/blue/blue_city.png"
};

const tiles = document.querySelectorAll(".game__board__cell");

tiles.forEach((tile) => {
    console.log(tile.children[0].src = IMAGE_CODE.blue_city);
});




