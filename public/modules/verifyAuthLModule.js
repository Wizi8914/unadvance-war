import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";


const auth = getAuth();


verifyAuth();

function verifyAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) return;

        window.location.href = "../login.html";
    });
}