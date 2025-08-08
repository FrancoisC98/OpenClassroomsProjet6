const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String },
    year: { type: Number },
    genre: { type: String }   
});

module.exports = mongoose.model('Book', bookSchema);