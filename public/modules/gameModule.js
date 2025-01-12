import { getDatabase, ref, set, get, query, orderByChild, startAt, endAt, onValue, equalTo, push } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const auth = getAuth();
const db = getDatabase();

function getGameID() {
    return window.location.href.split("=")[1];
}


function getGameInfo(gameID) {
    const db = getDatabase();
    const gameRef = ref(db, `games/${gameID}`);
  
    return get(gameRef)
      .then((snapshot) => (snapshot.exists() ? snapshot.val() : null))
      .catch((error) => {
        console.error("Erreur lors de la récupération des infos de la partie :", error);
        throw error;
      });
  }

getGameInfo(getGameID())
    .then((gameInfo) => {
        if (gameInfo) {
            console.log("Informations de la partie :", gameInfo);
        } else {
            console.log(`Aucune partie trouvée avec l'ID : ${gameID}`);
        }
        })
    .catch((error) => {
        console.error("Erreur :", error);
});