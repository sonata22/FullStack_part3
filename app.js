// taking .env variables into use, important to use it before Person model is imported
// This ensures that the environment variables from the .env file are available globally
// before the code from the other modules is imported.
const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const personsRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
// The first option to use a function is to require the whole object and refer to 
// functions through the object using the dot notation
const logger = require('./utils/logger')
// The other option is to destructure the functions to their own variables in the
// require statement: const { info, error } = require('./utils/logger')
// And then use them normally: info('message') or error('error message')
const mongoose = require('mongoose')
const morgan = require('morgan')

morgan.token('reqBody', function getId(req) {
    return JSON.stringify(req.body)
})

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())     // using json-parser (should be one of the first loaded into Express)
app.use(middleware.requestLogger)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))     // using morgan middleware


// The personsRouter is used if the URL of the request starts with the
// /api/persons. For this reason, the personsRouter object must only define the relative 
// parts of the routes, i.e.the empty path / or just the parameter /: id.
app.use('/api/persons', personsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
