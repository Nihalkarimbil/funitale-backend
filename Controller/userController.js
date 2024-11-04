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
        const user = await User.findOne({ username });
        console.log('admin logged');
        
        const token = jwt.sign(
            { id: 'admin', admin: true }, process.env.JWT_KEY, { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { id: 'admin', admin: true }, process.env.JWT_KEY, { expiresIn: '7d' }
        );

        // Send tokens in cookies
        res.cookie("token", token, {
            httpOnly: true, 
            secure: false,
            sameSite: "none",
            maxAge: 30 * 60 * 1000 // 30 minutes
        });
        
        res.cookie("refreshtoken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        user.refreshToken = refreshToken;
        await user.save()

        return res.status(200).json({ token, refreshToken, admin: true });
    ;
    }

    // User login and JWT
    const user = await User.findOne({ username });
    if (!user) {
        return next(new CustomError('User not found', 404));
    }
    
    const matching = await bcrypt.compare(password, user.password);
    if (!matching) {
        return next(new CustomError('Invalid credentials', 404));
    }

    // Generate tokens
    const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_KEY,
        { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.JWT_KEY,
        { expiresIn: '7d' }
    );

    // Save refresh token in the database
    user.refreshToken = refreshToken;
    await user.save();

    // Send tokens in cookies
    res.cookie("token", token, {
        httpOnly: true, 
        secure: false,
        sameSite: "none",
        maxAge: 30 * 60 * 1000
    });
    
    res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: 'success',
        message: "Logged in successfully",
        token,
        refreshToken,
        username,
        userID: user._id
    });
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

const refresh =async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: "Refresh token invalid" });

    jwt.verify(refreshToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token verification failed" });

        const newAccessToken = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_KEY,
            { expiresIn: '30m' }
        );

        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 30 * 60 * 1000
        });

        res.json({ accessToken: newAccessToken });
    });
};


module.exports = {
    //user login/register/logout
    userReg,
    userlogin,
    userLogout,
    refresh
}