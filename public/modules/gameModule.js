import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const auth = getAuth();
const db = getDatabase();

function getGameID() {
    return window.location.href.split("=")[1];
}


function getGameInfo(gameID) {
    const gameRef = ref(db, `games/${gameID}`);

    console.log(gameRef);

    get(gameRef).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    });
}

const gameInfo = getGameInfo(getGameID());

console.log(gameInfo);