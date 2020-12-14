const mongoose = require('mongoose');
const { mongoURI } = require('../config.json');

//Function that lets you connect to the DB
module.exports = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  return mongoose;
}