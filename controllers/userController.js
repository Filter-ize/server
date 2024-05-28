const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('../models/tokenModel.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');

//Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

//Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Por favor llene todos los campos');
    }
    if (password.length < 6) {
        req.status(400);
        throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    //Check if user exists
    const userExists = await User.findIne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('El email ha sido registrado anteriormente');
    }

    //Create new user
    const user = new User.create({
        naem,
        email,
        password
    })

    //Generate Token
    const token = generateToken(user._id);

    //Send HTTP-only cookie
    res.cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400 * 30), //30 days
        sameSige: 'none',
        secure: true,
    })

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        })
    } else {
        res.status(400);
        throw new Error('Los datos del usuario son inválidos');
    }
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error('Por favor agregue un email y una contraseña');
    }

    //Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        res.status(401);
        throw new Error('Usuario no encontrado, por favor registrese');
    }

    //User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    //Generate Token
    const token = generateToken(user._id);

    if (passwordIsCorrect) {
        //Send HTTP-only cookie
        res.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400 * 30), //30 days
            sameSite: 'none',
            secure: true,
        });
    }
    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        })
    } else {
        res.status(400);
        throw new Error('Email o contraseña inválidos');
    }
});

//Logout User
const logout = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true,
    });
    return res.status(200).json({ message: 'Has sido deslogeado con éxito' });
})

//Get user Data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

//Get login status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    }
    //Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        return res.json(true)
    }
    return res.json(false);
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { oldPassword, password } = req.body;

    if (!user) {
        res.status(400);
        throw new Error('Usuario no encontrado, por favor regístrese');
    }
    //Validate password
    if (!oldPassword || !password) {
        res.status(400);
        throw new Error('Por favor llene todos los campos');
    }

    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    //Save new password
    if (user && passwordIsCorrect) {
        user.password = password;
        await user.save();
        res.status(200).send('Contraseña actualizada con éxito');
    } else {
        res.status(400);
        throw new Error('Contraseña incorrecta');
    }
});

//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    //Check if user exists
    if (!user) {
        res.status(404);
        throw new Error('Usuario no encontrado, por favor regístrese');
    }

    //Delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    //Create Reset Token
    let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
    console.log(resetToken);

    //Hash token before saving to DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Save token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 30, //30 minutes
    }).save();

    //Construct Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    //Reset Email Template
    const message = `
    <h1>Hola ${user.name}</h1>
    <p>Por favor usa el link de abajo para re-establecer tu contraseña</p>
    <p>Este link estará habil por solo 30 minutos.</p>

    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

    <p>Saludos</p>
    `;
    const subject = 'Re-establecer Contraseña';
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({ success: true, message: 'Email enviado' });
    } catch (error) {
        res.status(500);
        throw new Error('Error al enviar el email');
    }
});

//Reset Password
const resetpassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    //Hash token, then compare to Token in DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Find token in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
        res.status(400);
        throw new Error('Token inválido o expirado');
    }

    //Find user in DB
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).json({
        message: 'Contraseña actualizada con éxito'
    });
});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetpassword,
};