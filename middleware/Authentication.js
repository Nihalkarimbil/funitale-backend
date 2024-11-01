const jwt = require('jsonwebtoken');
const CustomError = require('../utils/customError');

const userAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1] || req.cookies?.token; // Fixed: simplified optional chaining

    console.log("Authorization Header:", authHeader);
    console.log("Cookies:", req.cookies);

    // If no access token, check for the refresh token
    if (!token) {
        const refreshToken = req.cookies?.refreshtoken; // Fixed: corrected req.Cookies to req.cookies
        console.log("Refresh Token:", refreshToken);

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
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Fixed: secure to true in production
                sameSite: "none",
                maxAge: 30 * 60 * 1000,
            });

            req.user = decoded;

            return next();
        } catch (error) {
            return next(new CustomError('Invalid Refresh Token', 401));
        }
    }

    // If access token is present, verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return next(new CustomError('Invalid Access Token', 401));
    }
};

const adminAuthMiddleware = async (req, res, next) => {
    userAuthMiddleware(req, res, () => {
        if (req.user && req.user.admin) {
            next();
        } else {
            return next(new CustomError('You are not authorized', 403));
        }
    });
};

module.exports = { userAuthMiddleware, adminAuthMiddleware };
