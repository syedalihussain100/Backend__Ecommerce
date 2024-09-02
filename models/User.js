const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordCode: String,
  resetPasswordExpires: Date
},

  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  })

// Configure passport-local-mongoose to use email instead of username
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameQueryFields: ['email']
});

module.exports = mongoose.model('User', userSchema);
