const info = (...params) => {
    console.log(...params)
}

const error = (...params) => {
    console.error(...params)
}

// The file exports an object that has two fields, both of which are functions.
module.exports = {
    info, error
}