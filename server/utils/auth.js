const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function to decode the token and get the user
  authMiddleware: function (req) {
    let token = req.headers.authorization || '';

    // ["Bearer", "<tokenvalue>"]
    if (token) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      console.error('No token provided');
      return {};
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      return { user: data };
    } catch (error) {
      console.error('Invalid token');
      return {};
    }
  },
  
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
