import { getDatabase, ref, get, query, orderByChild, startAt, endAt, onValue, equalTo } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

const searchBar = document.getElementById("searchBar");
const suggestions = document.getElementById("suggestions");

const newGameBtn = document.querySelector(".new-game-button");

const db = getDatabase();

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

searchBar.addEventListener("input", (event) => {
    const searchText = event.target.value;
    searchPlayers(searchText);

    //checkPlayerExists(searchText);
    isButtonActivable();
});

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