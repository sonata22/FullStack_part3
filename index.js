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

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})