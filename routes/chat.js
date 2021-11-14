// * NPM Packages
const express = require('express');
const { check, validationResult } = require('express-validator');
const passport = require('passport');

const router = express.Router();

// * Controllers
const chatController = require('../controllers/chat');

// * Middlewares
const { protectUser } = require('../middleware/auth'); 

router.post('/add_conversation/:id', chatController.addConversation);
router.get('/my_conversation', chatController.getConversation);
router.get('/conversation/:id', chatController.getConversationById);

module.exports = router;