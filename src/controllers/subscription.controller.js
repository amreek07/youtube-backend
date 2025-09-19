import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!channelId || isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid channelId is required");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "channel unsubscribed successfully!"));
  } else {
    const subscribed = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, subscribed, "Subscribed successfully!"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Valid channelId is required");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribersCount: subscribers.length, subscribers },
        "Subscribers fetched successfully."
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

   if (!subscriberId || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Valid channelId is required");
  }

  const subscribedChannels = await Subscription.find({ subscriber: channelId })
    .populate("channels", "username email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannelsCount: subscribedChannels.length, subscribedChannels },
        "Subscribers fetched successfully."
      )
    );

});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
