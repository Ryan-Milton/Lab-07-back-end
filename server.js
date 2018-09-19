'use strict';

const express = require('express');

const superagent = require('superagent');

const cors = require('cors');

const app = express();

app.use(cors());

require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.get('/location', (request, respone) => {

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
      respone.send(locationResult);
    })

})

app.get('/weather', getWeather);

app.listen(PORT, () => console.log(`listening on ${PORT}`));

function searchToLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
  .then(res => {
    return {
      search_query: query,
      formatted_query: res.body.results[0].formatted_address,
      latitude: res.body.results[0].geometry.location.lat,
      longitude: res.body.results[0].geometry.location.lng
    }
  })
  .catch(error => handleError(error));
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(url)
  .then(result => {
    const weatherSummaries = [];
    result.body.daily.data.forEach( day => {
      const summary = new weatherSummaries(day);
      weatherSummaries.push(summary);
    });
    response.send(weatherSummaries);
  })
  .catch(error => handleError(error, response));
}

function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

function Weather(day) {
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
  this.forecast = day.summary;
}