const express = require('express');
const router = express.Router();
const upload = require ('../middleware/multer-config');
const bookCtrl = require('../controllers/book.controller');
const auth = require('../middleware/auth');

router.post('/:id/rating', auth, bookCtrl.rateBook)
router.post('/', auth, upload.single('image'), bookCtrl.createBook);
router.put('/:id', auth, upload.single('image'), bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);


router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', auth, bookCtrl.getOneBook);



module.exports = router;