const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleWare/errorMiddleware');
const userRouter = require('./routes/useRoutes.js');
const employeeRouter = require('./routes/employeeRoutes.js');
const contactRouter = require('./routes/contactRoutes.js');
const cartRouter = require('./routes/cartRoutes.js');
const helmet = require('helmet'); // Importar helmet
const axios = require('axios');

const app = express();

// Configurar helmet para encabezados de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'unsafe-inline', 'https://example.com'],
      styleSrc: ["'self'", 'unsafe-inline'],
      imgSrc: ["'self'", 'https://example.com'],
      fontSrc: ["'self'", 'https://example.com'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
}));

//Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://filter-ize-app.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

//Routes Middleware
app.use('/api/users', userRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/contactus', contactRouter);
app.use('/api/cart', cartRouter);

//Routes
app.get('/', (req, res) => {
  res.send('API is running');
});

//Error Middleware
app.use(errorHandler);

//Connect to MongoDB
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });