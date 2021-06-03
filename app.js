const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running...");
    });
  } catch (error) {
    console.log(`DB Error : ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET players Details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
  SELECT 
  * 
  FROM 
    cricket_team`;
  const players = await db.all(getPlayersQuery);
  const listOfPlayers = players.map((eachPlayer) =>
    convertDbObjectToResponseObject(eachPlayer)
  );
  response.send(listOfPlayers);
});

//ADD player details
app.post("/players/", async (request, response) => {
  const player = request.body;
  const { playerName, jerseyNumber, role } = player;
  const addPlayerQuery = `INSERT INTO
  cricket_team
  ( player_name, jersey_number, role)
  VALUES(
      '${playerName}',
      ${jerseyNumber},
      '${role}'
  );`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//GET player details
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
  SELECT 
  * 
  FROM 
    cricket_team 
  WHERE 
    player_id=${playerId}`;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

//Update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
