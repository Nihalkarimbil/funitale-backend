const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');

const userAuthMiddleware = (req, res, next) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : req.cookies?.token;
 
    if (!token) {
        return next(new CustomError('No access token provided', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new CustomError('Invalid or expired access token', 401));
    }
};

const adminAuthMiddleware = (req, res, next) => {
    userAuthMiddleware(req, res, () => {
        if (req.user && req.user.admin) {
            return next();
        } else {
            return next(new CustomError('You are not authorized', 403));
        }
    });
};

module.exports = { userAuthMiddleware, adminAuthMiddleware };
