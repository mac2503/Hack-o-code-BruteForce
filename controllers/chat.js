// * Utils
const { check, validationResult } = require('express-validator');

// * Models
const User = require('../models/user');
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// @desc     Create a conversation
// @route    POST /api/chat/add_conversation/:id
// @access   Private
module.exports.addConversation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send('error occured');
    }
    else {
  try {
    const user = await User.findById(req.params.id).lean();
    // Check if the id in parameter corresponds to an actual user in the database
    if (!user) {
      return next(new ErrorResponse('Invalid user', 400));
    }
    const participants = [req.user.id, user._id];
    // Checking for the existing conversation between the current participants
    const conversation = await Conversation.find({
      participant1: { $in: participants },
      participant2: { $in: participants },
    })
      .populate({ path: "messages" })
      .exec();

    if (!conversation || conversation.length === 0) {
      // Check if the user is trying to start a conversation with himself
      if (user._id.equals(req.user._id)) {
        return next(new ErrorResponse('You cannot start conversation with yourself!', 400));
      }
      let body = {
        participant1: req.user.id,
        participant2: user._id,
      };
      const newconversation = await (await Conversation.create(body)).populate({
        path: "messages",
      });
      res.status(200).json({
        success: true,
        data: newconversation,
      });
    }
    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.log(err);
    return  res.status(500).send({ error: "server error" });
  }
}
};

// @desc     Get all User's Conversation
// @route    GET /api/chat/my_conversation
// @access   Private
module.exports.getConversation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send('error occured');
    }
    else {
  try {
    const conversations = await Conversation.find({
      $or: [{ participant1: req.user.id }, { participant2: req.user.id }],
    }).lean();
    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    console.log(err);
    return  res.status(500).send({ error: "server error" });
  }
}
};

// @desc     Get a Conversation by ID
// @route    GET /api/chat/conversation/:id
// @access   Private
module.exports.getConversationById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send('error occured');
    }
    else {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate({ path: "messages" })
      .populate({ path: "participant1", select: "name" })
      .populate({ path: "participant2", select: "name" })
      .exec();

    if (!conversation) {
      return next(new ErrorResponse('No conversation found', 400));
    }
    // Check if the user accessing the conversation is a part of the same
    if (
      !conversation.participant1._id.equals(req.user.id) &&
      !conversation.participant2._id.equals(req.user.id)
    ) {
      return next(new ErrorResponse('Not authorized to view this!', 401));
    }
    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.log(err);
    return  res.status(500).send({ error: "server error" });
  }
}
};