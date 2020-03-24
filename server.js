require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require("cors");
const MOVIES = require('./movies-data-small.json');

const app = express();

// Setup the middleware
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

// Validate API token - More middleware
app.use(function validateBearerToken(req, res, next){
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;

    if (!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({error: "Unauthorized request"})
    }
    next()
})

// Create the endpoint with the function to handle movie filters
app.get('/movie', function handleGetMovies(req, res){
    let response = MOVIES;

    // logic to filter movies by requested parameters - genre, country and/or avg_votes
    //Find movies where the genre includes a specified string, case insensitive
    if(req.query.genre){
        response = response.filter(mv => mv.genre.toLowerCase().includes(req.query.genre.toLowerCase()));
    }

    // Find movies where the country includes a sp. string. case insensitive
    if(req.query.country){
        response = response.filter(mv => mv.country.toLowerCase().includes(req.query.country.toLowerCase()));
    }
    // Find movies where the average vote is >= to the supplied number
    if(req.query.avg_vote){
        response = response.filter(mv => Number(mv.avg_vote) >= Number(req.query.avg_vote));
    }
    // return the response
    res.json(response)
})

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production'){
        response = { error: { message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT =  process.env.PORT || 8000;

app.listen(PORT, () => {
})

