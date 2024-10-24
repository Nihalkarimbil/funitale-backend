const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');

const userAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1]||req.cookies.token // Bearer <token>
    
    
    
    console.log("DSAFSG",req.cookies);
    
    // console.log("SDFG",token);
    
    // If no access token, check for the refresh token
    if (!token) {
        const refreshToken = req.Cookies?.refreshtoken; // Read refresh token from cookies
        console.log(refreshToken);

        // If refresh token is missing, reject the request
        if (!refreshToken) {
            return next(new CustomError('No token or refresh token', 403));
        }

        // Try to verify and refresh the token
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

            // Generate a new access token
            const newAccessToken = jwt.sign(
                { id: decoded.id, username: decoded.username, email: decoded.email },
                process.env.JWT_KEY,
                { expiresIn: '30m' } // Access token valid for 30 minutes
            );

            // Set the new access token as a cookie
            res.cookie('token', newAccessToken, {
                httpOnly: true, // Secure and not accessible via JS
                secure: process.env.NODE_ENV === 'production', // Only use secure flag in production (HTTPS)
                sameSite: 'lax', // Adjust this for local development or production
                maxAge: 30 * 60 * 1000 // 30 minutes
            });

            // Attach user info to the request for further processing
            req.user = decoded;

            return next();
        } catch (error) {
            return next(new CustomError('Invalid Refresh Token', 401));
        }
    }

    // If access token is present, verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded; // Attach user info to the request
        next(); // Continue to the next middleware/route handler
    } catch (error) {
        return next(new CustomError('Invalid Access Token', 401));
    }
};

// Admin middleware extending userAuthMiddleware
const adminAuthMiddleware = async (req, res, next) => {
    userAuthMiddleware(req, res, () => {
        // Check if user has admin privileges
        if (req.user && req.user.admin) {
            next(); // Proceed if the user is an admin
        } else {
            return next(new CustomError('You are not authorized', 403));
        }
    });
};

module.exports = { userAuthMiddleware, adminAuthMiddleware };
