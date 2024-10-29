// const axios = require('axios');

const { default: axios } = require("axios");
// const HttpError = require("../models/http-error");

// const API_KEY = 'AIzaSyDgLmM'; //this should be gotten from google.

async function getCordsForAddress(address) {
  return {
    lat: 40.7484474,
    lng: -73.9871516,
  };
  //const response = await axios.get(
//   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}
//   &key=${API_KEY}`
//   );
  //the encodeURIcomponent function allows us to remove any unnceessary space in our address
//   const data = response.data;

//   if(!data || data.status === 'ZERO_RESULT') {
//     const error = new HttpError('Could not find location for the specified address.', 422); 
//     throw error;
//   }

//   const coordinates = data.results[0].geometry.location;

//   return coordinates
}

module.exports = getCordsForAddress;
