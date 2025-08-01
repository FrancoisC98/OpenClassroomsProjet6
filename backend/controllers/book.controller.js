const Book = require('../models/book');
const path = require ('path');
const sharp = require('sharp');


exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(err => res.status(500).json({ error: err.message }));
};


exports.getOneBook = (req, res) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      res.status(200).json(book);
    })
    .catch(err => res.status(500).json({ error: err.message }));
};


exports.createBook = (req, res, next) => {
    console.log("req.body:", req.body);
  const bookObject = JSON.parse(req.body.book);
  console.log('Body brut :', req.body);
  delete bookObject._id;

  const filename = `book_${Date.now()}.webp`;
  const outputPath = path.join(__dirname, '../images', filename);

  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image fournie.' });
}
    console.log(req.file)

  sharp(req.file.buffer)
    .resize(400, 600)
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
    console.log('Image traitée et enregistrée avec succès');


  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré avec image !'}))
    .catch(error => res.status(400).json({ error }));
})
.catch(error => res.status(500).json({ error }));
}


exports.updateBook = (req, res) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      if (book.userId !== req.userId) return res.status(403).json({ message: 'Requête non autorisée' });

      Object.assign(book, req.body);
      return book.save();
    })
    .then(updatedBook => {
      if (updatedBook) res.status(200).json(updatedBook);
    })
    .catch(err => res.status(400).json({ error: err.message }));
};


exports.deleteBook = (req, res) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      if (book.userId !== req.userId) return res.status(403).json({ message: 'Requête non autorisée' });

      return Book.deleteOne({ _id: req.params.id });
    })
    .then(() => res.status(200).json({ message: 'Livre supprimé' }))
    .catch(err => res.status(500).json({ error: err.message }));
};


exports.getBestRatedBooks = (req, res) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(err => res.status(500).json({ error: err.message }));
};
