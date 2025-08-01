const express = require('express');
const router = express.Router();
const upload = require ('../middleware/multer-config');
const bookCtrl = require('../controllers/book.controller');
const auth = require('../middleware/auth');

router.post('/', upload.single('image'), auth, bookCtrl.createBook);
router.put('/:id', auth, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

router.get('/', bookCtrl.getAllBooks);
router.get('/:id', auth, bookCtrl.getOneBook);
router.get('/bestrating', auth, bookCtrl.getBestRatedBooks);


module.exports = router;