const User = require('../models/user')


const allUsers = async (req, res) => {
    try {
        const users = await User.find({ blocked: false })
        res.status(200).json(users)
    } catch (error) {
        console.log(error)
        res.status(404).json('users not found', error)
    }
}

//delete User By ID
const deleteUser = async (req, res) => {
    try {
        const DeleteUser = await User.findByIdAndDelete(req.params.id)
        if (!DeleteUser) {
            return res.status(404).json('there is an error')
        }
        res.status(200).json()
    } catch (error) {
        console.log(error)
        res.status(500).json('error in deleting the user', error)
    }
}


//view one user
const viewUserbyId = async (req, res) => {
    try {
        const userbyId = await User.findById(req.params.id)
        if (!userbyId) {
            return res.status(404).json('user with this Id is not found')
        }
        res.status(200).json(userbyId)

    } catch (error) {
        console.log(error)
        res.status(500).json('error on viewing user', error)
    }
}

//update user
const Updateuser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);


        if (!user) {
            return res.status(404).json({ message: 'User with this ID not found' });
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

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating the user' });
    }
};

module.exports={ 
    allUsers,
    deleteUser,
    viewUserbyId,
    Updateuser
}
