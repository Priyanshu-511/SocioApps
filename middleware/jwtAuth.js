const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'mineSecretS.';

const jsonmiddleAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    
    if (!token && req.cookies) {
        token = req.cookies.authToken;
    }

    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) {
            res.clearCookie('authToken');
            return res.redirect('/');
        }
        req.user = user;
        next();
    });
};

const generateTokens = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            name: user.name, 
            email: user.email 
        },
        JWT_SECRET_KEY,
        { expiresIn: '2h' }
    );
};

module.exports = { jsonmiddleAuth, generateTokens };