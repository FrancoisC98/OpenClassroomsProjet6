const Book = require('../models/book');
const path = require ('path');
const sharp = require('sharp');
const mongoose = require('mongoose');
const fs = require ('fs');


exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(err => res.status(500).json({ error: err.message }));
};



exports.getOneBook = (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID invalide' });
  }

  Book.findById(id)
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      console.log("BOOK FROM DB :", book);

      const bookObject = book.toObject({ getters: true });

      // On force la conversion en string ou null si absent
      bookObject.userId = book.userId ? book.userId.toString() : null;
      console.log("Book object ready to send :", bookObject);

      res.status(200).json(bookObject);
    })
    .catch(err => {
      console.error("Erreur dans getOneBook :", err);
      res.status(500).json({ error: err.message });
    });
};


// AJOUTER LIVRE

exports.createBook = (req, res, next) => {
    console.log("req.auth:", req.body);
    console.log("req.body:", req.body);
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;

  const filename = `book_${Date.now()}.webp`;
  const outputPath = path.join(__dirname, '../images', filename);

  if (!req.file) {
    console.log("Aucun fichier reçu");
    return res.status(400).json({ error: 'Aucune image fournie.' });
}
    console.log(req.file)

sharp(req.file.path)
  .resize(400, 600)
  .webp({ quality: 80 })
  .toFile(outputPath)
  .then(() => {
    console.log('Image traitée et enregistrée avec succès');

    console.log('Données du livre à enregistrer:', {
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
    });

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
    });

    return book.save();
  })
  .then(() => res.status(201).json({ message: 'Livre enregistré avec image !' }))
  .catch(error => {
    console.error('Erreur sharp ou save :', error);
    res.status(500).json({ error });
  });
}


// MODIF LIVRE

exports.updateBook = (req, res) => {
  let bookObject = {};
  if (req.file) {
    bookObject = JSON.parse(req.body.book); // parce que côté client tu envoies 'book' en JSON stringifié
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  } else {
    bookObject = req.body;
  }
  Book.findById(req.params.id)
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      if (book.userId.toString() !== req.auth.userId) {
      return res.status(403).json({ message: 'Requête non autorisée' });
      }
      Object.assign(book, bookObject);
      console.log('Nouvelle imageUrl:', bookObject.imageUrl);
      return book.save();
    })
    .then(updatedBook => {
    console.log('Livre mis à jour:', updatedBook);
      if (updatedBook) res.status(200).json(updatedBook);
    })
    .catch(err => res.status(400).json({ error: err.message }));
};


// SUPPRIMER UN LIVRE 

exports.deleteBook = (req, res) => {
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId.toString() !== req.auth.userId) {
        return res.status(403).json({ message: 'Requête non autorisée' });
      }

      const filename = book.imageUrl?.split('/images/')[1]; 
      
      if (!filename) {
        console.warn("⚠ Aucun fichier image associé au livre.");
      }

      // Supprimer l'image puis le livre
      fs.unlink(`images/${filename}`, err => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier image:', err);
        }

        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre et image supprimés avec succès' }))
          .catch(error => res.status(500).json({ error: error.message }));
      });
    })
    .catch(err => res.status(500).json({ error: err.message }));
};



exports.getBestRatedBooks = (req, res) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(err => res.status(500).json({ error: err.message }));
};
