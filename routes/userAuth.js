const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updateDetails,
  updatePassword
} = require('../controllers/userAuth');

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-details', protect, updateDetails);
router.put('/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;