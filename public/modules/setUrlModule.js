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

function initializeHeader() {
    get(ref(db, `games/${GAME_ID}`))
        .then((snapshot) => {
            const data = snapshot.val();

            document.getElementById("player1-money").textContent = data.player1Money + " $";
            document.getElementById("player2-money").textContent = data.player2Money + " $";
            
            get(ref(db, `players/${data.player1}`))
                .then((snapshot) => {
                    const player1 = snapshot.val();

                    document.getElementById("player1-name").textContent = player1.name;
                    document.getElementById("player1-email").textContent = player1.email;
                });

            get(ref(db, `players/${data.player2}`))
                .then((snapshot) => {
                    const player2 = snapshot.val();

                    document.getElementById("player2-name").textContent = player2.name;
                    document.getElementById("player2-email").textContent = player2.email;
                });
        });
}

function initializeGame() {
    if (!GAME_ID) resetGameURL();
    if (!GAME_ID.startsWith("-")) resetGameURL();

    getGameInfo(GAME_ID)
        .then((gameInfo) => {
            if (gameInfo) {
                initializeHeader();
            } else {
                resetGameURL();
            }
        })
        .catch((error) => {
            console.error("Erreur :", error);
        });
}


