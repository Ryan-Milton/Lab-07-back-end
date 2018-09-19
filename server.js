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

app.listen(PORT, () => console.log(`listening on ${PORT}`));
