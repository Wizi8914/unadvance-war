import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const errorLabel = document.querySelector(".error-label");

const errorMessages = {
    "auth/email-already-in-use": "Email already in use",
    "auth/invalid-email": "Invalid email",
    "auth/invalid-credential": "Invalid password or email",
    "auth/weak-password": "Password is too weak",
    "auth/user-not-found": "User not found",
    "auth/wrong-password": "Wrong password",
    "auth/too-many-requests": "Too many requests, please try again later",
    "auth/network-request-failed": "Network error, please try again later",
}

const auth = getAuth();

const submitBtn = document.getElementById("submit");

submitBtn.addEventListener("click", event => {

    event.preventDefault();     // Prevent the form to reload the page

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (email === "") return displayError("Please enter your email");
    if (password === "") return displayError("Please enter your password");

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      displayUserLogin(user);
      openGame();
      resetForm();
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        displayErrorCode(errorCode);

        console.log(errorCode);
    });

});


function openGame() {
    window.location.href = "pre-game.html";
}

function displayErrorCode(message) {
    displayError(errorMessages[message]);
}

function displayError(message) {
    errorLabel.style.color = "red";
    errorLabel.textContent = message;
}

function displayUserLogin(user) {
    errorLabel.style.color = "green";
    let content = String(`Welcome ${user.email}`);
    errorLabel.textContent = content;
}

function resetForm() {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
}