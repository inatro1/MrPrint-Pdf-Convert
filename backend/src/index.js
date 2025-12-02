require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./auth');
const convertRoutes = require('./convert');

const app = express();
app.use(require('cors')());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/teoprint';
mongoose.connect(mongoUri, { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err=> console.error('Mongo connect error', err));

app.use('/api/auth', authRoutes);
app.use('/api', convertRoutes);

// static ping
app.get('/', (req,res)=> res.send('TEO PRINT CONVERT backend running'));

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('Server listening on', port));

// start worker in same container for simplicity (can be separate)
require('./worker');
