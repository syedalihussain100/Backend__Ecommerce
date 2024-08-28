const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Local Strategy for email/password authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: 'Invalid email or password' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


// Serialize and deserialize user instances to and from the session.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;































// const LocalStrategy = require('passport-local').Strategy;
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;



// module.exports = function (passport) {
//   passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password'
//   }, async (email, password, done) => {
//     try {
//       const user = await User.findOne({ email });
//       if (!user) return done(null, false, { message: 'Invalid email or password' });

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) return done(null, false, { message: 'Invalid email or password' });

//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }
//   ));


//   passport.serializeUser((user, done) => {
//     done(null, user.id);
//   });

//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await User.findById(id);
//       done(null, user);
//     } catch (err) {
//       done(err);
//     }
//   });
// }