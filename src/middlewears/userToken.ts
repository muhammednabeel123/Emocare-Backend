const jwt = require('jsonwebtoken')


const userToken = (req, res, next) => {
   
    const authHeader = req.headers['authorization'];
    
    const token = authHeader ; 
    if (!token) {
      return res.sendStatus(401); 
    }
       
    jwt.verify(token, 'secret', (err, user) => {
      if (err) {
        return res.sendStatus(403); 
      }
      req.user = user;
      next();
    });
  };
  

  module.exports = userToken