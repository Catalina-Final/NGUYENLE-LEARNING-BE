const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reactionSchema = Schema({
  user: { type: Schema.ObjectId, required: true, ref: "User" },
  targetType: { type: String, required: true, enum: ["Blog", "Review"] },
  target: {
    type: Schema.ObjectId,
    required: true,
    refPath: "targetType",
  },
  emoji: {
    type: String,
    required: true,
    enum: ["laugh", "sad", "like", "love", "angry"],
  },
});

reactionSchema.statics.calculateReaction = async function (
  targetId,
  targetType
) {
  const stats = await this.aggregate([
    {
      $match: { target: targetId },
    },
    {
      $group: {
        _id: "$target",
        laugh: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "laugh"] }, 1, 0],
          },
        },
        sad: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "sad"] }, 1, 0],
          },
        },
        like: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "like"] }, 1, 0],
          },
        },
        love: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "love"] }, 1, 0],
          },
        },
        angry: {
          $sum: {
            $cond: [{ $eq: ["$emoji", "angry"] }, 1, 0],
          },
        },
      },
    },
  ]);
  // console.log(stats);
  await mongoose.model(targetType).findByIdAndUpdate(targetId, {
    reactions: {
      laugh: (stats[0] && stats[0].laugh) || 0,
      sad: (stats[0] && stats[0].sad) || 0,
      love: (stats[0] && stats[0].love) || 0,
      like: (stats[0] && stats[0].like) || 0,
      angry: (stats[0] && stats[0].angry) || 0,
    },
  });
};

reactionSchema.post("save", function () {
  // this point to current review
  this.constructor.calculateReaction(this.target, this.targetType);
});

// Neither findByIdAndUpdate nor findByIdAndDelete have access to document middleware.
// They only get access to query middleware
// Inside this hook, this will point to the current query, not the current review.
// Therefore, to access the review, we’ll need to execute the query
reactionSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.findOne();
  next();
});

reactionSchema.post(/^findOneAnd/, async function (next) {
  await this.doc.constructor.calculateReaction(
    this.doc.target,
    this.doc.targetType
  );
});

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
// module.exports = mongoose.model("Reaction", reactionSchema);
