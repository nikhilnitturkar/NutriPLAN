const jwt = require('jsonwebtoken');
const Trainer = require('../models/Trainer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const trainer = await Trainer.findById(decoded.trainerId).select('-password');
    
    if (!trainer) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.trainer = trainer;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth; 