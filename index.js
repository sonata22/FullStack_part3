// taking .env variables into use, important to use it before Person model is imported
// This ensures that the environment variables from the .env file are available globally
// before the code from the other modules is imported.
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('reqBody', function getId(req) {
    return JSON.stringify(req.body)
})

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())     // using json-parser (should be one of the first loaded into Express)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))     // using morgan middleware

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', function (req, res) {
    Person.find({}).then(persons => {
        res.json(persons)
    })
})

app.get('/info', (request, response) => {
    const personsTotalNum = persons.length
    const currentDate = new Date()
    response.send(`<p>Phonebook has info for ${personsTotalNum} people<br/><br/>${currentDate}</p>`)
})

app.get('/api/persons/:id', (request, response, next) => {
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else { //executed if no object is found (object is null)
                response.status(404).end()
            }
        })
        // if no parameter passed to next() then the execution will move to
        // the next route of middleware
        // if next() is called with parameter, then execution will continue
        // to error handler middleware
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => { // result callback parameter could be used
            // for checking if a resource was actually deleted
            response.status(204).end()
        })
        .catch(error => next(error))
})

const doesExist = (parameter, value) => {
    const foundPerson = persons.find((person) => person[parameter] === value)
    console.log(`Was there any matching person found: ${JSON.stringify(foundPerson)}`)
    return foundPerson ? true : false
}

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    // if (!body.name) {
    //     return response.status(400).json({
    //         error: "Missing person's name."
    //     })
    // }
    // if (!body.number) {
    //     return response.status(400).json({
    //         error: "Missing person's number."
    //     })
    // }

    const person = {
        name: body.name,
        number: body.number,
    }

    Person
        .findByIdAndUpdate(
            request.params.id,
            person,
            { new: true }
        )
        .then(updatedPerson => response.json(updatedPerson))
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: "Missing person's name."
        })
    }
    if (doesExist("name", body.name)) {
        return response.status(400).json({
            error: "Name must be unique."
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: "Missing person's number."
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        // This ensures that the response is sent only if the operation succeeded
        .then(savedPerson => {
            // The data sent back in the response is the formatted version created
            // automatically with the toJSON method
            response.json(savedPerson)
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint) //middleware, will be used for catching requests made to non-existent routes

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    //in all other error situations, middlware passes error forward
    // to default Express error handler
    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'Malformed ID',
            errorMessage: error.message,
            errorBody: error
        })
    }

    next(error)
}

app.use(errorHandler) // has to be the last loaded middleware


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})