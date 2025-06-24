# 📦 Firebase Database Structure

This document outlines the structure of the Firebase Realtime Database used in the project.  
It is organized into three main branches: `games`, `maps`, and `players`.

---

## 🕹️ 1. `games` – Game Sessions

This node contains data for all ongoing and past game sessions.  
Each game is identified by a **unique auto-generated ID** (e.g., `-OGT8ODzxD5c-_yWinsw`).

### 📑 Fields

| Field           | Type      | Description |
|----------------|-----------|-------------|
| `createdAt`     | `int`     | Unix timestamp (in ms) when the game was created |
| `mapType`       | `int`     | Identifier for the type of map used |
| `pawnMap`       | `string[][]` or `object[][]` | A 2D array representing the current map state. Each cell may be:<br>- A string (`"neutral_city"`, `"red_city"`, etc.)<br>- An object if a unit is present: |
| ↳ `enable`     | `boolean` | Whether the unit is active |
| ↳ `health`     | `int`     | Unit’s current hit points |
| ↳ `type`       | `string`  | Type of unit (e.g., `"red_inf"` for red infantry) |
| `player1`       | `string`  | ID of Player 1 |
| `player1Money`  | `int`     | Current money for Player 1 |
| `player2`       | `string`  | ID of Player 2 |
| `player2Money`  | `int`     | Current money for Player 2 |
| `playerTurn`    | `string`  | Whose turn it is (e.g., `"blue"`) |
| `status`        | `string`  | Game state (e.g., `"ongoing"`, `"ended"`) |

---

## 🗺️ 2. `maps` – Available Maps

This branch defines all available maps for gameplay.  
Each map has a **unique name** (e.g., `map_1`, `map_2`, `map_3`).

### 🧭 Fields

| Field   | Type            | Description |
|---------|-----------------|-------------|
| `map`   | `string[][]`    | A 2D array representing the terrain. Each string indicates a tile type, such as: |
|         |                 | - `"mountain"`: Mountain terrain ⛰️ |
|         |                 | - `"grass"`: Grassland 🌱 |
|         |                 | - `"forest1"`, `"forest2"`: Different forest types 🌲 |
|         |                 | - `"neutral_city"`, `"red_city"`, `"blue_city"`: Cities (neutral or faction-owned) 🏙️ |

---

## 👤 3. `players` – Registered Users

This branch stores data for all registered players.  
Each player is identified by a **unique user ID** (e.g., `JwALJMnUL1M9gbuu2ikK2w28j9q2`).

### 🧾 Fields

| Field   | Type     | Description |
|---------|----------|-------------|
| `name`   | `string` | Player’s display name |
| `email`  | `string` | Player’s email address 📧 |
| `age`    | `string` | Player’s age (stored as a string) 🎂 |

---

## 🛠️ Notes

- All time values are stored as **Unix timestamps in milliseconds**.
- This structure is designed for **turn-based strategy gameplay**, where each player takes actions on their respective turns.
- The `pawnMap` supports both **static terrain** and **dynamic units** through flexible data typing.

---

## 📚 Example Use Case

```json
"games": {
  "-OGT8ODzxD5c-_yWinsw": {
    "createdAt": 1718630000000,
    "mapType": 1,
    "pawnMap": [
      ["grass", "neutral_city", "grass"],
      ["red_city", {"enable": true, "health": 10, "type": "red_inf"}, "grass"]
    ],
    "player1": "user_123",
    "player1Money": 500,
    "player2": "user_456",
    "player2Money": 400,
    "playerTurn": "blue",
    "status": "ongoing"
  }
}
