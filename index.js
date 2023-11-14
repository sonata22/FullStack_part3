const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('reqBody', function getId(req) {
    return JSON.stringify(req.body)
})

const app = express()

app.use(cors())
app.use(express.json())     // using json-parser
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
    res.json(persons)
})

app.get('/info', (request, response) => {
    const personsTotalNum = persons.length
    const currentDate = new Date()
    response.send(`<p>Phonebook has info for ${personsTotalNum} people<br/><br/>${currentDate}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    console.log(request.headers)
    console.log(request.get)
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    console.log(persons)
    response.status(204).end()
})

const doesExist = (parameter, value) => {
    const foundPerson = persons.find((person) => person[parameter] === value)
    console.log(`Was there any matching person found: ${JSON.stringify(foundPerson)}`)
    return foundPerson ? true : false
}

app.put('/api/persons/:id', (request, response) => {
    const body = request.body
    const id = Number(request.params.id)

    if (doesExist("id", body.id) === false) {
        return response.status(400).json({
            error: `Person with ID=${id} doesn't exist.`
        })
    }
    if (!body.name) {
        return response.status(400).json({
            error: "Missing person's name."
        })
    }
    if (!body.number) {
        return response.status(400).json({
            error: "Missing person's number."
        })
    }

    const newPerson = {
        id: id,
        name: body.name,
        number: body.number
    }

    persons = persons.map(person => person.id == id
        ? person = newPerson
        : person = person)

    console.log(persons)
    response.json(newPerson)
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

    const person = {
        id: Math.random(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint) //middleware, will be used for catching requests made to non-existent routes

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})