// The event handlers of routes are commonly referred to as controllers
// All of the routes related to persons are now in the persons.js module under
// the controllers directory.

// A router object is an isolated instance of middleware and routes.
// You can think of it as a “mini - application,” capable only of performing 
// middleware and routing functions. Every Express application has a built -in
// app router.

// The router is in fact a middleware, that can be used for defining "related routes"
// in a single place, which is typically placed in its own module.

const logger = require('./../utils/logger')
const personsRouter = require('express').Router()
const Person = require('./../models/person')

const doesExist = (parameter, value) => {
    Person.find({}).then(persons => {
        const foundPerson = persons.find((person) => person[parameter] === value)
        console.log(`Was there any matching person found: ${JSON.stringify(foundPerson)}`)
        return foundPerson ? true : false
    })
    return false
}

personsRouter.get('/', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

personsRouter.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        const currentDate = new Date()
        if (persons.length >= 1) {
            response.send(`<p>Phonebook has info for ${persons.length} people<br/><br/>${currentDate}</p>`)
        } else {
            response.send(`There are no entries in the Phonebook yet.<br/><br/>${currentDate}</p>`)
        }
    })
})

personsRouter.get('/:id', (request, response, next) => {
    logger.info(request.headers)
    logger.info(request.get)
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

personsRouter.post('/', (request, response, next) => {
    const body = request.body

    if (!body.name) { // equal to (body.name === undefined)
        return response.status(400).json({
            error: 'Missing person\'s name.'
        })
    }
    if (doesExist('name', body.name)) {
        return response.status(400).json({
            error: 'Name must be unique.'
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: 'Missing person\'s number.'
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
        .catch(error => next(error))
})

personsRouter.delete('/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(person => {
            if (person) {
                response.status(204).end()
            } else {
                return response.status(404)
                    .json({
                        error: `Person with ID=${request.params.id} doesn't exist or was already deleted.`
                    })
            }
        })
        .catch(error => next(error))
})

personsRouter.put('/:id', (request, response, next) => {
    const { name, number } = request.body
    Person
        .findById(request.params.id)
        .then(person => {
            if (person) {
                const body = request.body
                if (!body.name) {
                    return response.status(400).json({
                        error: 'Missing person\'s name.'
                    })
                }
                if (!body.number) {
                    return response.status(400).json({
                        error: 'Missing person\'s number.'
                    })
                }

                Person
                    .findByIdAndUpdate(
                        request.params.id,
                        { name, number },
                        { new: true, runValidators: true, context: 'query' }
                    )
                    .then(updatedPerson => response.json(updatedPerson))
                    .catch(error => next(error))
            } else { //executed if no object is found (object is null)
                return response.status(404)
                    .json({
                        error: `Person with ID=${request.params.id} doesn't exist or was already deleted.`
                    })
            }
        })
        // if no parameter passed to next() then the execution will move to
        // the next route of middleware
        // if next() is called with parameter, then execution will continue
        // to error handler middleware
        .catch(error => next(error))
})

module.exports = personsRouter