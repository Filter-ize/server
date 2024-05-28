const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetpassword,
} = require('../controllers/userController.js');
const protect = require('../middleWare/authMiddleware.js');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logout);
router.get('/getuser', protect, getUser);
router.get('/loggedin', loginStatus);
router.patch('/updateuser', protect, updateUser);
router.patch('/changepasword', protect, changePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetpassword);

module.exports = router;