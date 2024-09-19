const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./middleware');

const app = express();
const secretKey = 'asdfghjkl12345'; 

const users = [{ username: 'admin', password: 'admin123' }]; 

app.use(express.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(400).send('Username or password is incorrect');
  }

  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/', (req, res) => {
  res.send('Welcome to the Pokemon API!');
});


const authorizeAdmin = (req, res, next) => {
  if (req.user.username !== 'admin') {
    return res.status(403).send('Access Forbidden');
  }
  next();
};
const getPokemonData = () => {
  try {
    if (!fs.existsSync('pokemon.json')) {
      throw new Error('pokemon.json file not found');
    }
    const data = fs.readFileSync('pokemon.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing pokemon.json:', error);
    return [];
  }
};


app.get('/pokemon', authenticateToken, (req, res) => {
  const pokemonData = getPokemonData();
  res.json(pokemonData);
});

app.post('/pokemon', authenticateToken, authorizeAdmin, (req, res) => {
  const newPokemon = req.body;
  const pokemonData = getPokemonData();
  pokemonData.push(newPokemon);
  fs.writeFileSync('pokemon.json', JSON.stringify(pokemonData, null, 2), 'utf-8');
  res.status(201).json(newPokemon);
});

app.get('/pokemon/:id', authenticateToken, (req, res) => {
  const pokemonData = getPokemonData();
  const id = parseInt(req.params.id, 10) - 1; 
  const pokemon = pokemonData[id];
  if (pokemon) {
    res.json(pokemon);
  } else {
    res.status(404).send('Pokemon not found');
  }
});

app.put('/pokemon/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10) - 1; 
  const updatedPokemon = req.body;
  const pokemonData = getPokemonData();

  if (pokemonData[id]) {
    pokemonData[id] = updatedPokemon;
    fs.writeFileSync('pokemon.json', JSON.stringify(pokemonData, null, 2), 'utf-8');
    res.json(updatedPokemon);
  } else {
    res.status(404).send('Pokemon not found');
  }
});

app.delete('/pokemon/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10) - 1; 
  const pokemonData = getPokemonData();

  if (pokemonData[id]) {
    const deletedPokemon = pokemonData.splice(id, 1);
    fs.writeFileSync('pokemon.json', JSON.stringify(pokemonData, null, 2), 'utf-8');
    res.json(deletedPokemon);
  } else {
    res.status(404).send('Pokemon not found');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
