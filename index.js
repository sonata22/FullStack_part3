const express = require('express')
const app = express()
app.use(express.json()) // using json-parser

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

app.get('/api/persons', (request, response) => {
    const body = request.body

    response.json(persons)
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

    response.status(204).end()
})

const doesExist = (name) => {
    const foundPerson = persons.find((person) => person.name === name)
    return foundPerson ? true : false
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: "Missing person's name."
        })
    }

    if (doesExist(body.name)) {
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

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})