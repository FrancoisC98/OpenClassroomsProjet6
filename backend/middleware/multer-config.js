const multer = require('multer')
const path = require ('path')



// Filtre les fichiers, on veut que les images
const fileFilter = (req, file, callback) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        callback(null, true);
    }   else {
        callback(new Error('Seules les images sont acceptées'));
    }
};


const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // limite a 5mo modifiable
});

module.exports = upload;