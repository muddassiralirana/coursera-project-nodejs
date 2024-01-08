const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if the user is logged in using session
  if (req.session && req.session.userId) {
    // If the user is logged in, proceed to the next middleware
    next();
  } else {
    // If the user is not logged in, check for JWT token in the request headers
    const token = req.headers.authorization;

    if (token) {
      // Verify the JWT token
      jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized' });
        } else {
          // If the token is valid, set userId in session and proceed
          req.session.userId = decoded.userId;
          next();
        }
      });
    } else {
      // If no session or JWT token, return unauthorized
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
