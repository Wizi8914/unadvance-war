// Import the functions you need from the SDKs you need
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

	// Initialize the realtime database and get a reference to the service
    const db = getDatabase();

	var playerTurn = "A";
	var scoreA = 0;
	var scoreB = 0;
	var grid = [];
	var localUser = null;

	initializeGame();
	getLastGameData();

	export function initializeGame() {
		grid = [];
		playerTurn = "A";
		localUser = JSON.parse(window.localStorage.getItem("user"));
		console.log(localUser);

		var cn = document.getElementById("connectedName");
		cn.innerText = "Connecté : " + localUser.email;

		cn = document.getElementById("result");
		cn.innerText = "";

		// Initialize TicTacToe grid
		var e = document.getElementById("gridContainer");
		// Remove everything inside container to avoid creating multiple grids when clicking new game button
		e.innerHTML = "";

		for (var row = 0; row < 3; row++) {
			grid.push([0]);

			for (var column = 0; column < 3; column++) {
				var nie = document.createElement("input");
				nie.type = "button";
				nie.setAttribute("class", "square");
				nie.setAttribute("row", row);
				nie.setAttribute("column", column);
				e.append(nie);

				nie.addEventListener('click', (e) => {
					console.log(e);
					var row = e.target.attributes["row"].value;
					var column = e.target.attributes["column"].value;

					clickSquare(row, column, playerTurn);
					
					writeSquareClick(row, column, playerTurn);
					playerTurn = (playerTurn.valueOf() == "A".valueOf()) ? "B" : "A";

					checkVictory();
				});

				grid[row][column] = nie;
			}
			var nbre = document.createElement("br");
			e.append(nbre);
		}
	}

	function checkTrio(square1X, square1Y, square2X, square2Y, square3X, square3Y) {
		return (grid[square1X][square1Y].getAttribute("class") == grid[square2X][square2Y].getAttribute("class") && 
			grid[square1X][square1Y].getAttribute("class") == grid[square3X][square3Y].getAttribute("class"));
	}

	function comboFound()
	{
		// First column, First line and top-left to bottom-right diagonal
		var square1 = grid[0][0].getAttribute("class");
		if (square1 != "square") {
			if (checkTrio(0, 0, 1, 0, 2, 0) || checkTrio(0, 0, 0, 1, 0, 2) || checkTrio(0, 0, 1, 1, 2, 2))
				return square1;
		}

		// Second column
		square1 = grid[0][1].getAttribute("class");
		if (square1 != "square" && checkTrio(0, 1, 1, 1, 2, 1))
			return square1;

		// Right column and bottom-left to top-right diagonal
		square1 = grid[0][2].getAttribute("class");
		if (square1 != "square") {
			if (checkTrio(0, 2, 1, 2, 2, 2) || checkTrio(0, 2, 1, 1, 2, 0))
				return square1;
		}
	
		// Central line
		square1 = grid[1][0].getAttribute("class");
		if (square1 != "square" && checkTrio(1, 0, 1, 1, 1, 2))
			return square1;
	
		// Bottom line
		square1 = grid[2][0].getAttribute("class");
		if (square1 != "square" && checkTrio(2, 0, 2, 1, 2, 2))
			return square1;

		return null;
	}

	function checkVictory()
	{
		var cf = comboFound();
		if (cf != null) {
			var cn = document.getElementById("result");
			if (cf == "square circle")
				cn.innerText = "Victoire du joueur A";
			else
				cn.innerText = "Victoire du joueur B";

			for (var row = 0; row < 3; row++) {
				for (var column = 0; column < 3; column++) {
					grid[row][column].disabled = true;
				}
			}
		}
	}

	function clickSquare(row, column, player) {
		console.log(player);
		if (player.valueOf() == "A".valueOf())
			grid[row][column].setAttribute("class", "square circle");
		else
			grid[row][column].setAttribute("class", "square cross");

		grid[row][column].disabled = true;
	}

	// Say hello function call
	const newGameButton = document.querySelector("#newGame");
	
	if (newGameButton != null) {
		newGameButton.addEventListener('click', () => {
			clearGame();
			initializeGame();
		});
	}

	// Save a record in the realtime database
	// ------------------------------------------------------------
	export function writeSquareClick(row, column, symbol) {		
		update(
			ref(db, "tictactoe/" + row + "/" + column), 
			{
				symbol: symbol
			}
		).then(docRef => {
    		console.log("Document has been added successfully");
		}).catch(error => {
			console.log(error.code);
			console.log(error.message);
		});
	}

	// Delete database current game
	// ------------------------------------------------------------
	export function clearGame() {		
		remove(
			ref(db, "tictactoe")
		).then(docRef => {
    		console.log("Document has been deleted successfully");
		}).catch(error => {
			console.log(error.code);
			console.log(error.message);
		});
	}
	
	// ------------------------------------------------------------
	export function getLastGameData() {
		const docRef = ref(db, "tictactoe");
		
		get(docRef)
		.then(docSnap => {
			if (docSnap.exists()) {
				console.log("Last game information:", docSnap.val());
			
				var lastGameData = docSnap.val();
				for (var row = 0; row < 3; row++) {
					if (lastGameData.hasOwnProperty(row)) {
						for (var column = 0; column < 3; column++) {
							if (lastGameData[row.toString()].hasOwnProperty(column.toString())) {
								console.log(row, column, lastGameData[row.toString()][column.toString()].symbol);
								clickSquare(row, column, lastGameData[row.toString()][column.toString()].symbol);
							}
						}
					}
				}
			}
			else {
				console.log("No saved game!");
			}
		})
		.catch((error) => {
			console.log(error.code);
			console.log(error.message);
		});

		const scoreRef = ref(db, "tictactoeScore");

		var cn = document.getElementById("victories");		
		
		get(scoreRef)
		.then(docSnap => {
			if (docSnap.exists()) {
			
				var lastGameData = docSnap.val();

				scoreA = lastGameData.scoreA ? lastGameData.scoreA : 0;
				scoreB = lastGameData.scoreB ? lastGameData.scoreB : 0;
			}
			else {
			}
		})
		.catch((error) => {
			console.log(error.code);
			console.log(error.message);
		});
		cn.innerText = "Score du joueur A: " + scoreA + " / Score du joueur B: " + scoreB;
	}

