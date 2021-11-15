const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updateDetails,
  updatePassword,
  getTotalPoints,
  getTotalCurrentSavings,
  getTotalExpectedSavings
} = require('../controllers/userAuth');
const {
  addPost,
  getPostById,
  updatePost,
  deletePost
} = require("../controllers/post");

const router = express.Router();

const {protect} = require('../middleware/userAuth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-details', protect, updateDetails);
router.put('/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

router.get('/get-total-points', protect, getTotalPoints);
router.get('/get-total-current-savings', protect, getTotalCurrentSavings);
router.get('/get-total-expected-savings', protect, getTotalExpectedSavings);

router.post("/add-post", protect, addPost);
router.get("/post/:id", protect, getPostById);
router.put('/update-post/:id', protect, updatePost);
router.delete("/delete-post/:id", protect, deletePost);

module.exports = router;