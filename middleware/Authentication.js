const jwt = require('jsonwebtoken');

const userAuthMiddleware = async (req, res, next) => {
    const token = req.cookies?.token;  
    
    if (!token) {
        return res.status(403).json({ message: 'No Token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
};


const adminAuthMiddleware=async (req,res,next)=>{
    userAuthMiddleware (req,res,()=>{
        if(req.user.admin){
            next()
        }else{
            throw new error('you are not authorised',403)
        }
    })
}
module.exports = { userAuthMiddleware ,adminAuthMiddleware};
