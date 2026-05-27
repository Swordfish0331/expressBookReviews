const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

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
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (err) {
    const book = books[isbn];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: `No book found with ISBN ${isbn}` });
    }
  }
});

// Get books by author — using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    res.status(200).json(response.data);
  } catch (err) {
    const keys = Object.keys(books);
    const matched = keys
      .filter((k) => books[k].author.toLowerCase() === author.toLowerCase())
      .map((k) => ({ isbn: k, ...books[k] }));
    if (matched.length > 0) {
      res.status(200).json(matched);
    } else {
      res.status(404).json({ message: `No books found by author: ${author}` });
    }
  }
});

// Get books by title — using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    res.status(200).json(response.data);
  } catch (err) {
    const keys = Object.keys(books);
    const matched = keys
      .filter((k) => books[k].title.toLowerCase().includes(title.toLowerCase()))
      .map((k) => ({ isbn: k, ...books[k] }));
    if (matched.length > 0) {
      res.status(200).json(matched);
    } else {
      res.status(404).json({ message: `No books found with title: ${title}` });
    }
  }
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
