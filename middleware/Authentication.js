const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');

const userAuthMiddleware = (req, res, next) => {
    console.log("Request Headers:", req.headers);

    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : req.cookies?.token;

    console.log("Authorization Header:", authHeader);
    console.log("Cookies:", req.cookies);

    // Check if the access token exists
    if (!token) {
        return next(new CustomError('No access token provided', 401));
    }

    // Verify the access token
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log("Decoded Token:", decoded);  // Log decoded token
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error);
        return next(new CustomError('Invalid or expired access token', 401));
    }
};

// Admin middleware (checks if user is admin)
const adminAuthMiddleware = (req, res, next) => {
    userAuthMiddleware(req, res, () => {
        if (req.user && req.user.admin) {
            return next();
        } else {
            console.log("User is not an admin:", req.user);
            return next(new CustomError('You are not authorized', 403));
        }
    });
};

module.exports = { userAuthMiddleware, adminAuthMiddleware };
