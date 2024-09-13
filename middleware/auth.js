const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; 

        if (!token) return res.status(401).send('Unauthorized');

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.status(403).send('Forbidden');
            req.userId = user.id; 
            next();
        });
    } catch (e) {
        console.log(e);
        res.status(401).send('Token Expired or Invalid');
    }
};

module.exports = auth;
