const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));