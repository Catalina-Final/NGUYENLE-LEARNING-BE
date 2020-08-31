const utilsHelper = require("../helpers/utils.helper");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Friendship = require("../models/friendship");
const userController = {};

userController.register = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return next(new Error("User already exists"));

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    user = await User.create({
      name,
      email,
      password,
    });
    const accessToken = user.generateToken();

    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { user, accessToken },
      null,
      "Register successful"
    );
  } catch (error) {
    next(error);
  }
};

userController.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { user },
      null,
      "Get current user successful"
    );
  } catch (error) {
    next(error);
  }
};

userController.sendFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const toUserId = req.params.id; // To
    let friendship = await Friendship.findOne({ from: userId, to: toUserId });
    if (!friendship) {
      await Friendship.create({
        from: userId,
        to: toUserId,
        status: "requesting",
      });
      return utilsHelper.sendResponse(
        res,
        200,
        true,
        null,
        null,
        "Request has ben sent"
      );
    } else {
      switch (friendship.status) {
        case "requesting":
          return next(new Error("The request has been sent"));
          break;
        case "accepted":
          return next(new Error("Users are already friend"));
          break;
        case "accepted":
        case "decline":
        case "cancel":
          friendship.status = "requesting";
          await friendship.save();
          return utilsHelper.sendResponse(
            res,
            200,
            true,
            null,
            null,
            "Request has ben sent"
          );
          break;
        default:
          break;
      }
    }
  } catch (error) {
    next(error);
  }
};

userController.acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // To
    const fromUserId = req.params.id; // From
    let friendship = await Friendship.findOne({
      from: fromUserId,
      to: userId,
      status: "requesting",
    });
    if (!friendship) return next(new Error("Request not found"));

    friendship.status = "accepted";
    await friendship.save();
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friend request has been accepted"
    );
  } catch (error) {
    next(error);
  }
};

userController.declineFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // To
    const fromUserId = req.params.id; // From
    let friendship = await Friendship.findOne({
      from: fromUserId,
      to: userId,
      status: "requesting",
    });
    if (!friendship) return next(new Error("Request not found"));

    friendship.status = "decline";
    await friendship.save();
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friend request has been declined"
    );
  } catch (error) {
    next(error);
  }
};

userController.cancelFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const toUserId = req.params.id; // To
    let friendship = await Friendship.findOne({
      from: userId,
      to: toUserId,
      status: "requesting",
    });
    if (!friendship) return next(new Error("Request not found"));

    friendship.status = "cancel";
    await friendship.save();
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friend request has been cancelled"
    );
  } catch (error) {
    next(error);
  }
};

userController.removeFriendship = async (req, res, next) => {
  try {
    const userId = req.userId;
    const toBeRemovedUserId = req.params.id;
    let friendship = await Friendship.findOne({
      $or: [
        { from: userId, to: toBeRemovedUserId },
        { from: toBeRemovedUserId, to: userId },
      ],
      status: "accepted",
    });
    if (!friendship) return next(new Error("Friend not found"));

    friendship.status = "removed";
    await friendship.save();
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      null,
      null,
      "Friendship has been removed"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
