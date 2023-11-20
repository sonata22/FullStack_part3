const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('LOG: Connecting to: ', url)

mongoose.connect(url)
    .then(result => {
        console.log('LOG: Connected to MongoDB')
    })
    .catch((error) => {
        console.log('LOG: Error connecting to MongoDB: ', error.message)
    })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', { //new method
    virtuals: true,
    versionKey: false,
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)