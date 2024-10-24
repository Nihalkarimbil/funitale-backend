const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { JoiUserSchema } = require('../models/validation')
const bcrypt = require('bcrypt')
const CustomError = require('../utils/customError')


//user register
const userReg = async (req, res, next) => {
    const { value, error } = JoiUserSchema.validate(req.body)
    const { username, password, confpassword, email } = value

    if (error) {
        return next(new CustomError(error.details[0].message, 400))
    }

    if (password !== confpassword) {
        // return res.status(400).json({ error: 'Passwords do not match' });
        return next(new CustomError('Passwords do not match', 400))
    }

    const hashedpassword = await bcrypt.hash(password, 8)
    const newUser = new User({ username, password: hashedpassword, confpassword: hashedpassword, email })
    await newUser.save()
    res.status(200).json({ status: 'succes', message: 'Registerd succesfully', data: newUser })

}

//user login
const userlogin = async (req, res, next) => {

    const { value, error } = JoiUserSchema.validate(req.body);
    if (error) {
        return next(new CustomError('Validation error: ' + error.details[0].message, 400));
    }
    const { username, password } = value;

    // Admin login JWT
    const adminName = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    if (username === adminName && password === adminPass) {
        console.log('admin logged');
        const token = jwt.sign(
            { id: 'admin', admin: true }, process.env.JWT_KEY, { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { id: 'admin', admin: true }, process.env.JWT_KEY, { expiresIn: '7d' }
        );
        res.cookie("token", token, {
            httpOnly: true, 
            secure: false, // Disable 'secure' for development (non-HTTPS)
            sameSite: "none", // Use 'lax' for local development
            maxAge: 30 * 60 * 1000 // 30 minutes
        });
        
        res.cookie("refreshtoken", refreshToken, {
            httpOnly: true,
            secure: false, // Disable 'secure' for development
            sameSite: "none", // 'lax' works fine on localhost
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        return res.status(200).json({ token: token, refreshToken, admin: true });
    }

    // User login and JWT
    const user = await User.findOne({ username });
    if (!user) {
        return next(new CustomError('user not found', 404));
    }
    
    const matching = await bcrypt.compare(password, user.password);
    if (!matching) {
        return next(new CustomError('invalid credentials', 404));
    }

    const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_KEY, { expiresIn: '30m' });
    
    const refreshToken = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_KEY, { expiresIn: '7d' });

    res.cookie("token", token, {
        httpOnly: true, 
        secure: false, // Disable 'secure' for development (non-HTTPS)
        sameSite: "none", // Use 'lax' for local development
        maxAge: 30 * 60 * 1000 // 30 minutes
    });
    
    res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: false, // Disable 'secure' for development
        sameSite: "none", // 'lax' works fine on localhost
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({ status: 'success', message: "Logged in successfully", token: token, refreshToken });
};


const userLogout = async (req, res, next) => {
    try {
        res.clearCookie('token','refreshtoken', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        res.status(200).json({ status: 'success', message: 'Logout successful' });

    } catch (error) {
        next(new CustomError('Logout failed', 500));
    }
};


module.exports = {
    //user login/register/logout
    userReg,
    userlogin,
    userLogout
}