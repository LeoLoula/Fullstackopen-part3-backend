const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)
mongoose
  .connect(url)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

if (process.argv.length < 2) {
  console.log('give password as argument')
  process.exit(1)
}

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  name: process.argv[2],
  number: process.argv[3],
})

if (process.argv[2] === undefined) {
  Person.find({}).then((persons) => {
    console.log('phonebook:')
    persons.forEach((person) => {
      console.log(person.name + ' ' + person.number)
    })
    mongoose.connection.close()
  })
} else {
  console.log(`added ${process.argv[2]} number ${process.argv[3]} to phonebook`)
  person.save().then((result) => {
    mongoose.connection.close()
  })
}

module.exports = mongoose.model('Person', personSchema)
