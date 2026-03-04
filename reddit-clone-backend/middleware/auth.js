const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  // Standard format is "Bearer <token>"
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Extract the actual token string
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Malformed token.' });
  }

  try {
    // 2. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach the decoded user payload (id, username) to the request object
    req.user = decoded;
    
    // 4. Move to the next middleware or the actual route handler
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};