// Utils
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require("../middleware/async");

// Models
// const User = require("../models/user");
const Post = require("../models/Post");

// @desc     Add a post
// @route    POST /api/v1/user/add-post
// @access   Private
exports.addPost = asyncHandler(async (req, res, next) => {
  let body = { ...req.body};
  const newValue = { ...body, postedBy: req.user._id };
  const post = await Post.create(newValue);
  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc     Get a post by id
// @route    GET /api/v1/user/post/:id
// @access   Private
exports.getPostById = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .exec();
    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      data: err,
    });
  }
});

// @desc      Update user details
// @route     PUT /api/v1/user/update-post/:id
// @access    Private
exports.updatePost = asyncHandler (async (req, res, next) => {
  const fieldsToUpdate = {
    caption: req.body.caption,
    description: req.body.description
  }
  let post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post doesn't exist" });
    }
  // Check the person updating is the owner of the post
  if (!post.postedBy.equals(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: "Not authorised to perform this action",
    });
  }
  post = await Post.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc     Delete A Post
// @route    DELETE /api/v1/user/delete-post/:id
// @access   Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post doesn't exist" });
    }
    // Check the person deleting is the owner of the post
    if (!post.postedBy.equals(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "Not authorised to perform this action",
      });
    }

    await post.remove();

    res.status(200).json({
      success: true,
      data: "Successfully deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      data: err,
    });
  }
});