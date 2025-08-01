const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)

    console.log('Connexion à MongoDB réussie');
}   catch (error) {
    console.log ('Conenxion à MongoDB échouée: ', error);
    process.exit(1);
}
};

module.exports = connectDB