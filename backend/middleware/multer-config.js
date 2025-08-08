const multer = require('multer')
const path = require ('path')



// Filtre les fichiers, on veut que les images
const fileFilter = (req, file, callback) => {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', 'webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        callback(null, true);
    }   else {
        callback(new Error('Seules les images sont acceptées'));
    }
};


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.split(' '). join('_').replace(path.extname(file.originalname),'');
        const ext = path.extname(file.originalname)
        cb(null, name + Date.now() + ext);
    }
});

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // limite a 5mo modifiable
});

module.exports = upload;