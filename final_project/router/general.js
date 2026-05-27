const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
const public_users = express.Router();

// Get all books — using Promise callback
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject('No books found');
    }
  })
    .then((allBooks) => res.status(200).json(allBooks))
    .catch((err) => res.status(500).json({ message: err }));
});

// Get book by ISBN — using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  await axios.get('http://localhost:5000/')
    .then((response) => {
      const allBooks = response.data;
      const book = allBooks[isbn];
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: `No book found with ISBN ${isbn}` });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// Get books by author — using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  await axios.get('http://localhost:5000/')
    .then((response) => {
      const allBooks = response.data;
      const keys = Object.keys(allBooks);
      const matched = keys
        .filter((k) => allBooks[k].author.toLowerCase() === author.toLowerCase())
        .map((k) => ({ isbn: k, ...allBooks[k] }));
      if (matched.length > 0) {
        res.status(200).json(matched);
      } else {
        res.status(404).json({ message: `No books found by author: ${author}` });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// Get books by title — using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  await axios.get('http://localhost:5000/')
    .then((response) => {
      const allBooks = response.data;
      const keys = Object.keys(allBooks);
      const matched = keys
        .filter((k) => allBooks[k].title.toLowerCase().includes(title.toLowerCase()))
        .map((k) => ({ isbn: k, ...allBooks[k] }));
      if (matched.length > 0) {
        res.status(200).json(matched);
      } else {
        res.status(404).json({ message: `No books found with title: ${title}` });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
});

// Get book review by ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: `No book found with ISBN ${isbn}` });
  }
});

module.exports.general = public_users;
