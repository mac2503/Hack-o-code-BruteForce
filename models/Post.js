const mongoose = require("mongoose");
// const User = require("./user");

const PostSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: null
    },
    description: {
      type: String
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    postedOn: {
      type: Date,
      default: new Date(),
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model("Post", PostSchema);