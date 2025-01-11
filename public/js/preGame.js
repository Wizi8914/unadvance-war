const createGameBtn = document.getElementById('create-game-button');
const currentGameBtn = document.getElementById('play-current-game-button');

createGameBtn.addEventListener('click', () => {
    window.location.href = "new-game.html";
});

currentGameBtn.addEventListener('click', () => {
    console.log('play current game');
});

