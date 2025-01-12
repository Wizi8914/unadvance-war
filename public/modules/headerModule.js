import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const playerName = document.getElementById('player-name');
const playerAge = document.getElementById('player-email');
const playerEmail = document.getElementById('player-email');
const emailVerified = document.querySelector('.email-verified');

const disconnectBtn = document.querySelector('.logout-button');

const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";

    const playersRef = ref(db, 'players/' + user.uid);

    get(playersRef).then((snapshot) => {
        const data = snapshot.val();
        playerName.textContent = data.name;
        playerAge.textContent = data.age;
        playerEmail.textContent = user.email;
        emailVerified.textContent = booleanToText(user.emailVerified);
    });

});

function booleanToText(boolean) {
    return boolean ? "Yes" : "No";
}

disconnectBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    })
    .catch((error) => {
        console.log(error);
    });
});
