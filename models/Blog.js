/**
 * @route GET api/blogs?page=1&limit=10 - Get blogs with pagination
 * @route GET api/users/:id/blogs?page=1&limit=20 - Get blogs from user
 * @route GET api/blogs/friends?page=1&limit=20 - Get blogs from friends
 * @route GET api/blogs/:id - Get blog detail
 * @route POST api/blogs/:id - Create a new blog
 * @route PUT api/blogs/:id - Update a blog
 * @route DELETE api/blogs/:id - Remove a blog
 */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reactions: {
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
  },
  reviewCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
});
blogSchema.plugin(require("./plugins/isDeletedFalse"));

module.exports = mongoose.model("Blog", blogSchema);
