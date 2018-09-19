'use strict';

// need to add .env file in directory with all API_KEYS
// important to put a '.env' in a server.js

// Initialising all dependencies we will use
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();

// connecting cors to our app
app.use(cors());

// connecting a .env file in directory
require('dotenv').config();

// setting up a port
const PORT = process.env.PORT || 3000;

// getting requests and do function on once recieved
app.get('/location', searchToLatLong);
app.get('/weather', getWeather);
app.get('/yelp', getYelp);
app.get('/movies', getMovie);

// running server on a PORT and console.log state
app.listen(PORT, () => console.log(`listening on ${PORT}`));

//-----------------------------------------------------------
// Functions to run on recieving requests
// ALL API KEYS HAVE TO BE IN .env WITH SAME NAME

//-----------------------------------------
// handle LOCATION request

function searchToLatLong(request, response)
{
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GOOGLE_API_KEY}`;
  return superagent.get(url)
    .then(result =>
    {
      const locationResult =
    {
      search_query: request.query.data,
      formatted_query: result.body.results[0].formatted_address,
      latitude: result.body.results[0].geometry.location.lat,
      longitude: result.body.results[0].geometry.location.lng,
    };
      response.send(locationResult);
    })
    .catch(error => handleError(error));
}

//-----------------------------------------
// handle WEATHER request

function getWeather(request, response)
{
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(url)
    .then(result =>
    {
      const weatherSummaries = result.body.daily.data.map( day => new Weather(day));
      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));
}

//-----------------------------------------
// handle YELP request

function getYelp(request, response)
{
  const url = `https://api.yelp.com/v3/businesses/search?location=${request.query.data.search_query}`;

  return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(result => {
      const yelpSummaries = result.body.businesses.map( business => new Business(business));
      response.send(yelpSummaries);
    })
    .catch(error => handleError(error, response));
}

//-----------------------------------------
// handle MOVIE request

function getMovie(request, response)
{
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.THE_MOVIE_DB_API}&query=${request.query.data.search_query}`;

  return superagent.get(url)
    .then(result =>
    {
      const moviesSummaries = result.body.results.map( movie => new Movie(movie));
      response.send(moviesSummaries);
    })
    .catch(error => handleError(error, response));
}


//-----------------------------------------
// generic error handler function

function handleError(err, res)
{
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}


//-----------------------------------------
// helping functions for a working with a data
// constructors


function Weather(day)
{
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.forecast = day.summary;
}

function Business(business)
{
  this.name = business.name;
  this.image_url = business.image_url;
  this.price = business.price;
  this.rating = business.rating;
  this.url = business.url;
}

function Movie(movie)
{
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.vote_average;
  this.image_url = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}