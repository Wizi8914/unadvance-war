import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const searchBar = document.getElementById("searchBar");
const suggestions = document.getElementById("suggestions");

const newGameBtn = document.querySelector(".new-game-button");

const auth = getAuth();
const db = getDatabase();

/**
 * Searches for players based on the provided search text and updates the suggestions list.
 *
 * @param {string} searchText - The text to search for players.
 */
function searchPlayers(searchText) {
    if (!searchText.trim()) {
        suggestions.innerHTML = "";
        return;
    }

    const playersRef = ref(db, "players");
    const playerNameQuery = query(playersRef, orderByChild("name"), startAt(searchText), endAt(searchText + "\uf8ff"));

    onValue(playerNameQuery, (snapshot) => {
        suggestions.innerHTML = "";

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const player = childSnapshot.val();
                const li = document.createElement("li");
                li.textContent = `${player.name} (Age: ${player.age})`;
                li.style.cursor = "pointer";

                li.addEventListener("click", () => {
                    searchBar.value = player.name;
                    suggestions.innerHTML = "";

                    isButtonActivable();
                });

                suggestions.appendChild(li);
            });
        } else {
            const noResult = document.createElement("li");

            noResult.textContent = "No player found.";
            noResult.style.color = "gray";
            suggestions.appendChild(noResult);
        }
    });
}

/**
 * Checks if the new game button should be activable based on the search bar input.
 * If the search bar is empty, the button is disabled.
 * If the search bar contains text, it queries the database to check if a player with the given name exists.
 * If a player with the given name exists, the button is enabled; otherwise, it is disabled.
 *
 * @async
 * @function isButtonActivable
 * @returns {Promise<void>} A promise that resolves when the button state has been updated.
 */
async function isButtonActivable() {
    const searchText = searchBar.value.trim();
    if (!searchText) {
        newGameBtn.classList.add('disabled');
        return;
    }

    const playersRef = ref(db, "players");
    const playerNameQuery = query(playersRef, orderByChild("name"), equalTo(searchText));

    const snapshot = await get(playerNameQuery);

    if (snapshot.exists()) {
        newGameBtn.classList.remove('disabled');
    } else {
        newGameBtn.classList.add('disabled');
    }
}

async function getUidByName(playerName) {
    if (!playerName.trim()) return null;

    const db = getDatabase();
    const snapshot = await get(query(ref(db, "players"), orderByChild("name"), equalTo(playerName)));
    return snapshot.exists() ? Object.keys(snapshot.val())[0] : null;
}

function pickRandomMap() {
    return Math.floor(Math.random() * 3) + 1;
}

async function createGame() {

    const player1Uid = auth.currentUser.uid;
    const player2Uid = await getUidByName(searchBar.value.trim());
    
    const gameRef = push(ref(db, "games"));
  
    const gameData = {
        player1: player1Uid,
        player2: player2Uid,
        mapType: pickRandomMap(),
        status: "ongoing",
        createdAt: Date.now() 
    };
  
    return set(gameRef, gameData)
        .then(() => {
            console.log("Partie créée avec succès :", gameRef.key);
            return gameRef.key;
        })
        .catch((error) => {
            console.error("Erreur lors de la création de la partie :", error);
            throw error;
        });
}
  
searchBar.addEventListener("input", (event) => {
    const searchText = event.target.value;
    searchPlayers(searchText);
    
    isButtonActivable();
});
    
newGameBtn.addEventListener("click", async () => {
    const searchText = searchBar.value.trim();

    if (!searchText) return;

    console.log(searchBar.value);

    createGame().then((gameId) => {
        window.location.href = `game.html?id=${gameId}`;
    });
});
