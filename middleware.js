const jwt = require('jsonwebtoken');
const secretKey = 'asdfghjkl12345';  


const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; 

  if (!token) return res.status(401).send('Access Denied');

  try {
    const verifiedUser = jwt.verify(token, secretKey); 
    req.user = verifiedUser; 
    next(); 
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

module.exports = { authenticateToken };
