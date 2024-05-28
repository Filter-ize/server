const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Por favor agregue un nombre'],
    },
    email:{
        type: String,
        required: [true, 'Por favor agregue un correo electrónico'],
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Por favor agregue una contraseña'],
        minLength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    },
    photo: {
        type: String,
        required: [true, 'Por favor agregue una foto de perfil'],
        default: 'https://i.ibb.co/4pDNDk1/avatar.png'
    },
    phone: {
        type: String,
        default: ''
    },
    bio:{
        type: String,
        maxLength: [250, 'La biografía no puede tener más de 250 caracteres'],
        default: 'Hola! Este soy yo!'
    },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next();
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;