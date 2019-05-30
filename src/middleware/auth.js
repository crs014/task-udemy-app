const jwt = require('jsonwebtoken');
const User = require('../models/User');

/*const auth = (req, res, next) => {
        return (async (req, res, next) => {
            try {
                const token = req.header('Authorization').replace('Bearer ','');
                const decoded = jwt.verify(token, 'rahasia');
                const user = await User.findOne({ _id : decoded._id, 'tokens.token' : token });
            if(!user) {
                throw new Error();  
            }

            req.user = user;
            req.token = token;
            next();        
        } catch (error) {
            res.status(401).send({ 'error' : 'Authentication error'})
        }
    })(req, res, next);
};*/

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id : decoded._id, 'tokens.token' : token });
        if(!user) {
            throw new Error();  
        }
        req.user = user;
        req.token = token;
        next();        
    } catch (error) {
        res.status(401).send({ 'error' : 'Authentication error'})
    }
};

module.exports = auth;