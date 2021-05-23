const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getAllMovieNames = `
SELECT 
movie_name
FROM
movie
ORDER BY
movie_id;`;

  const movieList = await db.all(getAllMovieNames);
  response.send(
    movieList.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
//module.exports = app;

//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieDetails = `
INSERT INTO
movie
(director_id,movie_name,lead_actor)
VALUES
(${directorId},'${movieName}','${leadActor}');`;
  await db.run(addMovieDetails);
  response.send("Movie Successfully Added");
});
//module.exports = app;

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
SELECT *
FROM
movie
WHERE
movie_id = ${movieId};`;

  const movie = await db.get(getMovie);
  response.send(convertMovieDbObjectToResponseObject(movie));
});
//module.exports = app;

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovie = `
UPDATE
movie
SET
director_id = ${directorId},
movie_name = '${movieName}',
lead_actor = '${leadActor}'
WHERE
movie_id = ${movieId};`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});
//module.exports = app;

//API 5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
DELETE FROM
movie 
WHERE
movie_id = ${movieId};`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});
//module.exports = app;

//API 6
app.get("/directors/", async (request, response) => {
  const getAllDirectorsQuery = `
SELECT *
FROM
director
ORDER BY
director_id;`;
  const directorsArray = await db.all(getAllDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});
//module.exports = app;

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovies = `
SELECT
movie_name 
FROM movie
WHERE
director_id = ${directorId};`;
  const moviesArray = await db.all(getDirectorMovies);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
