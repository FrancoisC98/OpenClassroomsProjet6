const express = require ('express');
const dotenv = require ('dotenv');
const connectDB = require ('./config/db')
const bookRoutes = require ('./routes/book.routes')
const authRoutes = require ('./routes/auth')
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

dotenv.config();
const app = express();

//Middleware
app.use(express.json());

//CORS
app.use(cors({
  origin: true, // autorise toutes les origines (pour test)
  credentials: true,
}));


//Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Acces au dossier image
app.use('/images', express.static(path.join(__dirname, 'images')));

//Connexion à MongoDB
connectDB();

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes)

//Route accueil
app.get('/',(req, res) => {
    res.send('Bienvenue dans Mon Vieux Grimoire');
});

//Démarrage serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT,() => {
    console.log(`Serveur lancé sur le port ${PORT}`);
})