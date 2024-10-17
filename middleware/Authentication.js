const jwt = require('jsonwebtoken');
const CustomError= require('../utils/customError')

const userAuthMiddleware = async (req, res, next) => {
    // const token = req.cookies?.token;  
    const authHeader = req.headers['authorization'];
    const Token = authHeader && authHeader.split(' ')[1];

    if (!Token) {
        const refreshToken = res.cookies?.refreshtoken;
        if (!refreshToken) {
            return next(new CustomError('no token or refresh token',403))
        }
        try {
            const decoded=jwt.verify(refreshToken,process.env.JWT_KEY)

            const newtoken=jwt.sign({id:decoded.id,username:decoded.username,email:decoded.email},process.env.JWT_KEY,{ expiresIn: '15m' })

            res.cookie('token', newtoken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000,
                sameSite: 'none'
            });
            req.user=decoded
            next()
        } catch (error) {
            return next(new CustomError('Invalid Refresh Token',401))
        }
    }else{
        try {
            const decoded = jwt.verify(Token, process.env.JWT_KEY);
            req.user = decoded;
            next();
    
        } catch (error) {
            return next(new CustomError('Invalid Token'))
        }
    }

};


const adminAuthMiddleware = async (req, res, next) => {
    userAuthMiddleware(req, res, () => {
        if (req.user && req.user.admin) {
            next()
        } else {
            return next(new CustomError ('you are not authorised',403))
        }
    })
}
module.exports = { userAuthMiddleware, adminAuthMiddleware };
