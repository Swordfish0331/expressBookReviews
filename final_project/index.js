const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticated, isValid, users } = require('./auth_users.js');
const { general } = require('./general.js');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
  })
);

// Auth middleware for protected routes
app.use('/customer/auth/*', function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken;
    jwt.verify(token, 'access', (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: 'User not authenticated' });
      }
    });
  } else {
    return res.status(403).json({ message: 'User not logged in' });
  }
});

// Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  users.push({ username, password });
  return res.status(200).json({ message: 'User successfully registered. You can now login.' });
});

app.use('/customer', authenticated);
app.use('/', general);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
