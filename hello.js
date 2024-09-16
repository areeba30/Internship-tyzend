const axios = require('axios');
const fs = require('fs');

let apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
let allPokemonData = [];

function getAllData(url) {
  axios.get(url)
    .then(response => {
      allPokemonData = allPokemonData.concat(response.data.results);

      if (response.data.next) {
        getAllData(response.data.next);
      } else {
        fs.writeFileSync('pokemon.json', JSON.stringify(allPokemonData, null, 2));
        console.log('All data saved to pokemon file');
      }
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

getAllData(apiUrl);
