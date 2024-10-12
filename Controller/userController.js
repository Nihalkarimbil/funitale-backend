const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { JoiUserSchema } = require('../models/validation')
const bcrypt = require('bcrypt')


//user register
const userReg = async (req, res) => {
    const { value, error } = JoiUserSchema.validate(req.body)
    const { username, password, confpassword, email } = value

    if (error) {
        throw new error
    }

    try {
        const hashedpassword = await bcrypt.hash(password, 8)
        const newUser = new User({ username, password: hashedpassword, confpassword, email })
        await newUser.save()
        res.status(200).json({ status: 'succes', message: 'Registerd succesfully', data: newUser })

    } catch (error) {
        res.status(404).json(error)
    }

}

//user login
const userlogin = async (req, res) => {
    const { value, error } = JoiUserSchema.validate(req.body)
    const { username, password } = value;

    try {
        //admin login jwt
        const adminName = process.env.ADMIN_USERNAME
        const adminPass = process.env.ADMIN_PASSWORD
        if (username === adminName && password === adminPass) {
            console.log('admin logged')
            const token = jwt.sign(
                { id: 'admin', admin: true }, process.env.JWT_KEY, { expiresIn: '1d' }
            )
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000,
            });
            return res.status(200).json({ token, admin: true });
        }
        //user login and jwt

        const user = await User.findOne({ username })
        if (!user) {
            return res.status(404).json({ status: 'eror', message: 'user not found' })
        }
        const matching = await bcrypt.compare(password, user.password)
        if (!matching) {
            return res.status(400).json({ status: 'error', message: 'invalid credentials' })
        }

        const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_KEY, { expiresIn: '1d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none'
        });
        res.status(200).json({ status: 'succes', message: "Logined succesfully", token })
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Login failed', error: error.message })
    }
}



module.exports = {
    //user login and register
    userReg,
    userlogin,
}