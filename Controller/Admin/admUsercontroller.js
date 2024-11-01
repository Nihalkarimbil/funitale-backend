
const User = require('../../models/user')
const CustomError = require('../../utils/customError')

//get all users
const allUsers = async (req, res) => {
    const users = await User.find({ admin:false })
    res.status(200).json(users)

}

//delete User By ID
const deleteUser = async (req, res, next) => {

    const DeleteUser = await User.findByIdAndDelete(req.params.id)
    if (!DeleteUser) {
        return next(new CustomError("there is an error"))
    }
    res.status(200).json()

}


//view one user
const viewUserbyId = async (req, res, next) => {

    const userbyId = await User.findById(req.params.id)
    if (!userbyId) {
        return next(new CustomError('user with this Id is not found', 404))
    }
    res.status(200).json(userbyId)

}

//update user
const Updateuser = async (req, res, next) => {

    const user = await User.findById(req.params.id);


    if (!user) {
        return next(new CustomError('User with this ID not found', 404))
    }

    if (user.blocked === true) {
        user.blocked = false;
        await user.save();
        return res.status(200).json({ message: 'User has been successfully unblocked' });
    } else {
        user.blocked = true;
        await user.save();
        return res.status(200).json({ message: 'User has been successfully blocked' });
    }


};

module.exports = {
    allUsers,
    deleteUser,
    viewUserbyId,
    Updateuser
}
