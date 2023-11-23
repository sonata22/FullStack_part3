const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('LOG: Connecting to: ', url)

mongoose.connect(url)
  .then(() => {
    console.log('LOG: Connected to MongoDB')
  })
  .catch((error) => {
    console.log('LOG: Error connecting to MongoDB: ', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function (value) {
        return /\d{2}-\d{6}/.test(value) || /\d{3}-\d{5}/.test(value)
      },
      message: props => `${props.value} is not a valid number.`
    },
    required: [true, 'User phone number is required']
  },
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