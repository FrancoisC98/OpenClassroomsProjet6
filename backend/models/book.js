const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String },
    year: { type: Number },
    genre: { type: String }   
});

module.exports = mongoose.model('Book', bookSchema);