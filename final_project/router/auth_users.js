const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username:"ali",
    password:123
  }
];

const isValid = (username) => {
  // Write code to check if the username is valid
  // For simplicity, let's assume that any non-empty username is valid
  return username.trim() !== "";
}

const authenticatedUser = (username, password) => {
  // Write code to check if the username and password match the ones we have in records.
  // For simplicity, let's assume that we have a users array with objects having 'username' and 'password' properties
  const user = users.find(u => u.username === username && u.password === password);
  return user !== undefined;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username) || !isValid(password)) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  if (authenticatedUser(username, password)) {
    // Generate a JWT token and send it in the response
    const token = jwt.sign({ username: username }, 'your-secret-key', { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token: token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review (requires authentication)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  // Verify JWT token
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaSIsImlhdCI6MTcwNDcyMjc5MSwiZXhwIjoxNzA0NzI2MzkxfQ.2eURlILj4_EPB52H7UrIaPIhVDmwOp12JHnYPpa_rIk', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    } else {
      // Find the book by ISBN and add the review
      const book = books.find(b => b.isbn === isbn);
      if (book) {
        book.reviews.push({ username: decoded.username, review: review });
        return res.status(200).json({ message: "Review added successfully" });
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    }
  });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Verify JWT token
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    } else {
      // Find the book by ISBN
      const book = books[isbn];
      
      if (book) {
        // Find the index of the review in the book's reviews array
        const reviewIndex = book.reviews.findIndex(r => r.username === decoded.username);

        // If the review exists, remove it
        if (reviewIndex !== -1) {
          book.reviews.splice(reviewIndex, 1);
          return res.status(200).json({ message: "Review deleted successfully" });
        } else {
          return res.status(404).json({ message: "Review not found" });
        }
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    }
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
