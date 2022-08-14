require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())
app.use(express.static('build'))
const Person = require('./models/mongo')

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1,
  },
  {
    name: 'Martti Tienari',
    number: '040-123456',
    id: 2,
  },
  {
    name: 'Arto Järvinen',
    number: '040-123456',
    id: 3,
  },
  {
    name: 'Lea Kutvonen',
    number: '040-123456',
    id: 4,
  },
  {
    name: 'Leo Loula',
    number: '044-3202090',
    id: 5,
  },
]

morgan('tiny')

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find((person) => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then((person) => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  })
})

app.get('/info', (req, res) => {
  const length = Object.keys(persons).length
  console.log(length)
  res.send('Phonebook has info for ' + length + ' people')
})

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end()
    })
    .catch((error) => {
      res.status(400).send({ error: 'malformed id' })
    })
  const id = Number(req.params.id)
  persons = persons.filter((person) => person.id !== id)
  res.status(204).end()
})

app.put('/api/persons/:id', (req, res) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
    id: body.id,
  }
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(formatPerson(updatedPerson))
    })
    .catch((error) => {
      console.log(error)
      res.status(400).send({ error: 'malformatted id' })
    })
})

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0
  return maxId + 1
}

/* POST middleware*/
app.use(
  morgan(':method :url :status :res[content-length] - :res-time ms :content')
)

morgan.token('content', (req, res) => {
  return JSON.stringify(req.body)
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (body.name === undefined) {
    return res.status(400).json({ error: 'Nimiä ei löydy' })
  }
  if (body.number === undefined) {
    return res.status(400).json({ error: 'Numeroa ei löydy' })
  }

  if (persons.map((person) => person.name).includes(body.name)) {
    return res.status(400).json({ error: 'Nimen pitää olla uniikki!' })
  }

  if (persons.map((person) => person.number).includes(body.number)) {
    return res.status(400).json({ error: 'Numeron pitää olla uniikki' })
  }

  const person = new Person({
    name: body.content,
    number: body.important || false,
    id: generateId(),
  })

  person.save().then((savedperson) => {
    res.json(savedperson)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
