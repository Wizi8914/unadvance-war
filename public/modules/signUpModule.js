import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const errorMessages = {
    "auth/email-already-in-use": "Email already in use",
    "auth/invalid-email": "Invalid email",
    "auth/weak-password": "Password is too weak",
    "auth/user-not-found": "User not found",
    "auth/wrong-password": "Wrong password",
    "auth/too-many-requests": "Too many requests, please try again later",
    "auth/network-request-failed": "Network error, please try again later",
    "auth/invalid-email": "Invalid email",
}

const auth = getAuth();

const submitBtn = document.getElementById("submit");

submitBtn.addEventListener("click", event => {

    event.preventDefault();     // Prevent the form to reload the page

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    if (name === "") return displayError("Please enter your name");
    if (age === "") return displayError("Please enter your age");
    if (email === "") return displayError("Please enter your email");
    if (password === "") return displayError("Please enter your password");
    if (passwordConfirm === "") return displayError("Please confirm your password");
    if (password !== passwordConfirm) return displayError("Passwords do not match");

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;


        initPlayerInDatabase(user.uid, name, age, email);

        sendEmailVerification(auth.currentUser).then(() => {
            console.log("Email sent");
        });

        confirmUserSignIn(email);

    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        displayErrorCode(errorCode);
        // ..
    });
});

function initPlayerInDatabase(uid, name, age, email) {
    const db = getDatabase();
    const playersRef = ref(db, 'players/' + uid);
    set(playersRef, {
        name: name,
        age: age,
        email: email
    });
}

function displayErrorCode(message) {
    displayError(errorMessages[message]);
}

function displayError(message) {
    const error = document.querySelector(".error-label");
    error.style.color = "red";

    error.textContent = message
}

function confirmUserSignIn(user) {
    const userLogin = document.querySelector(".error-label");
    userLogin.style.color = "green";

    userLogin.textContent = `Account created for ${user}. Please verify your email address.`;
}

function resetForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
}







