'use strict';

// need to add .env file in directory with all API_KEYS

// Initialising all dependencies we will use
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();

// connecting cors to our app
app.use(cors());

// connecting a .env file in directory
require('dotenv').config();


const PORT = process.env.PORT || 3000;

app.get('/location', searchToLatLong);

app.get('/weather', getWeather);

app.get('/yelp', getYelp);

app.get('/movies', getMovie);

app.listen(PORT, () => console.log(`listening on ${PORT}`));

///////////////// Helper Functions

function searchToLatLong(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GOOGLE_API_KEY}`;
  return superagent.get(url)
  .then(result => {
    console.log(url);
    const locationResult = {
      search_query: request.query.data,
      formatted_query: result.body.results[0].formatted_address,
      latitude: result.body.results[0].geometry.location.lat,
      longitude: result.body.results[0].geometry.location.lng,
    }
    response.send(locationResult);
  })
  .catch(error => handleError(error));
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(url)
  .then(result => {
    const weatherSummaries = result.body.daily.data.map( day => new Weather(day));
    response.send(weatherSummaries);
  })
  .catch(error => handleError(error, response));
}

function getYelp(request, response) {
console.log('testing getYelp functin');
 const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;

 return superagent.get(url)
   .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
   .then(result => {
    const yelpSummaries = result.body.businesses.map( business => new Business(business));
    response.send(yelpSummaries);
  })
};

function getMovie(request, response) {
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THE_MOVIE_DB_API}&query=${request.query.data.search_query}`;

  return superagent.get(url)
  .then(result => {
    console.log(result.body)
    const moviesSummaries = result.body.results.map( movie => new Movie(movie));
    response.send(moviesSummaries);
  })
  .catch(error => handleError(error, response));
 }

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

///////////// Constructor Functions

function Weather(day) {
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.forecast = day.summary;
}

function Business(business) {
  this.name = business.name;
  this.image_url = business.image_url;
  this.price = business.price;
  this.rating = business.rating;
  this.url = business.url
}

function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  // this.total_votes = this.votes_total;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
 }