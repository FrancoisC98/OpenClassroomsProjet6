const Book = require('../models/book');
const path = require ('path');
const sharp = require('sharp');
const mongoose = require('mongoose');
const fs = require ('fs');
const book = require('../models/book');


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

      bookObject.userId = book.userId ? book.userId.toString() : null; // force la conversion en string ou null si absent
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

  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;

  bookObject.ratings = Array.isArray(bookObject.ratings) ? bookObject.ratings : [];

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
    bookObject = JSON.parse(req.body.book);
    bookObject.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  } else {
    bookObject = req.body;
  }
  bookObject.ratings = Array.isArray(bookObject.ratings) ? bookObject.ratings : [];
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

// NOTE LIVRES

exports.rateBook = (req, res) => {
  console.log('rateBook appelé', req.params.id, req.body, req.auth.userId);
  const { rating } = req.body;
  const userId = req.auth.userId;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      book.ratings = Array.isArray(book.ratings) ? book.ratings : [];

      if (book.ratings.find(r => r.userId === userId)) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      book.ratings.push({ userId, grade: rating });

      book.averageRating =
        book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length;

      return book.save();
    })
    .then(updatedBook => {
      if (updatedBook) {
        res.status(200).json(updatedBook);
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Erreur serveur', error: err });
    });
};


// 3 meilleurs livres

exports.getBestRatedBooks = (req, res) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
    .then(books => res.status(200).json(books))
    .catch(err => res.status(500).json({ error: err.message }));
};
