import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const createGameBtn = document.getElementById('create-game-button');
const currentGameBtn = document.getElementById('play-current-game-button');

const auth = getAuth();
const db = getDatabase();


onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {        
        const gameId = await getGameIdForCurrentPlayer(currentUser);
        
        if (gameId) {
            console.log(gameId)

            displayGameTimeCreation(gameId)

            
            currentGameBtn.addEventListener('click', () => {
                window.location.href = `game.html?id=${gameId}`;
            });
            
        } else {
            currentGameBtn.classList.add('disabled');
        }
    }
});

createGameBtn.addEventListener('click', () => {
    window.location.href = "new-game.html";
});

function displayGameTimeCreation(gameId) {
    get(ref(db, `games/${gameId}`))
        .then((snapshot) => {
            
            document.getElementById('last-game-time').textContent = timeStampToDate(snapshot.val().createdAt);
            
            snapshot.val().createdAt
            
        });
}

function timeStampToDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}


async function getGameIdForCurrentPlayer(currentUser) {
    const playerUid = currentUser.uid;
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


