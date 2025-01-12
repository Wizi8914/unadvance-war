import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const auth = getAuth();
const db = getDatabase();
const GAME_ID = getGameID();

let USER;

onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
        USER = currentUser;
        
        initializeGame();
    }
});

function getGameID() {
    return window.location.href.split("=")[1];
}

async function getGameIdForCurrentPlayer() {
    const playerUid = USER.uid;
    const gamesRef = ref(db, "games");
    const player1Query = query(gamesRef, orderByChild("player1"), equalTo(playerUid));
    const player2Query = query(gamesRef, orderByChild("player2"), equalTo(playerUid));

    const [player1Snapshot, player2Snapshot] = await Promise.all([get(player1Query), get(player2Query)]);

    if (player1Snapshot.exists()) {
        return Object.keys(player1Snapshot.val())[0];
    } else if (player2Snapshot.exists()) {
        return Object.keys(player2Snapshot.val())[0];
    } else {
        return null;
    }
}


function getGameInfo(gameID) {
    const db = getDatabase();
    const gameRef = ref(db, `games/${gameID}`);
    
    return get(gameRef)
    .then((snapshot) => (snapshot.exists() ? snapshot.val() : null))
    .catch((error) => {
        console.error(error);
        throw error;
    });
}

function resetGameURL() {
    getGameIdForCurrentPlayer()
        .then((gameId) => {
            if (gameId) {
                window.location.href = `game.html?id=${gameId}`;
            } else {
                console.log("No game found for the current player.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function initializeGame() {
    if (!GAME_ID) resetGameURL();
    if (!GAME_ID.startsWith("-")) resetGameURL();

    getGameInfo(GAME_ID)
        .then((gameInfo) => {
            if (gameInfo) {
                console.log("Informations de la partie :", gameInfo);
            } else {
                resetGameURL();
            }
        })
        .catch((error) => {
            console.error("Erreur :", error);
        });
}


