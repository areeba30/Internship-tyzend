const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const getPokemonData = () => {
  try {
    if (!fs.existsSync("pokemon.json")) {
      throw new Error("pokemon.json file not found");
    }
    const data = fs.readFileSync("pokemon.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing pokemon.json:", error);
    return []; 
  }
};


app.get("/", (req, res) => {
  res.send("Welcome to the Pokemon API!");
});

//all pokemon
app.get("/pokemon", (req, res) => {
  const pokemonData = getPokemonData();
  res.json(pokemonData);
});

// Get a single Pokemon by ID 
app.get("/pokemon/:id", (req, res) => {
  const pokemonData = getPokemonData();
  const id = parseInt(req.params.id, 10) - 1; 
  const pokemon = pokemonData[id];
  if (pokemon) {
    res.json(pokemon);
  } else {
    res.status(404).send("Pokemon not found");
  }
});

// Create a new Pokemon
app.post("/pokemon", (req, res) => {
  const newPokemon = req.body;
  const pokemonData = getPokemonData();
  pokemonData.push(newPokemon);
  fs.writeFileSync(
    "pokemon.json",
    JSON.stringify(pokemonData, null, 2),
    "utf-8"
  );
  res.status(201).json(newPokemon);
});

// Update a Pokemon by ID
app.put("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id, 10) - 1; 
  const updatedPokemon = req.body;
  const pokemonData = getPokemonData();

  if (pokemonData[id]) {
    pokemonData[id] = updatedPokemon;
    fs.writeFileSync(
      "pokemon.json",
      JSON.stringify(pokemonData, null, 2),
      "utf-8"
    );
    res.json(updatedPokemon);
  } else {
    res.status(404).send("Pokemon not found");
  }
});

// Delete a Pokemon by ID
app.delete("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id, 10) - 1; 
  const pokemonData = getPokemonData();

  if (pokemonData[id]) {
    const deletedPokemon = pokemonData.splice(id, 1);
    fs.writeFileSync(
      "pokemon.json",
      JSON.stringify(pokemonData, null, 2),
      "utf-8"
    );
    res.json(deletedPokemon);
  } else {
    res.status(404).send("Pokemon not found");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





