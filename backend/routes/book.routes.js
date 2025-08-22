const express = require('express');
const router = express.Router();
const upload = require ('../middleware/multer-config');
const bookCtrl = require('../controllers/book.controller');
const auth = require('../middleware/auth');

router.post('/:id/rating', auth, bookCtrl.rateBook) // notation
router.post('/', auth, upload.single('image'), bookCtrl.createBook); // création
router.put('/:id', auth, upload.single('image'), bookCtrl.updateBook); // modification
router.delete('/:id', auth, bookCtrl.deleteBook); // suppression


router.get('/', bookCtrl.getAllBooks); // récupération de tous les livres
router.get('/bestrating', bookCtrl.getBestRatedBooks); // récupération des 3 meilleurs livres
router.get('/:id', bookCtrl.getOneBook); // récupération d'un livre



module.exports = router;