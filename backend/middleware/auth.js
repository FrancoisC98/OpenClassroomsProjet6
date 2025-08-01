const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ message: 'Authentification manquante'});
        }

        const token = authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = { userId: decodedToken.userId };

        next();
    }   catch (error) {
        res.status(401).json({ message: 'Requête non authentifiée'})
    }
};