import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//this whole page functions are pending to handle 

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "VideoId is required!");
  }
  const existingVideoLike = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: new mongoose.Types.ObjectId(req.user?._id),
  });

  if (existingVideoLike) {
    await Like.findByIdAndDelete(existingVideoLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked successfully!"));
  }

  const videoLike = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videoLike, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "commentId is required");
  }

  const existingCommentLike = await Like.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: new mongoose.Types.ObjectId(req.user?._id),
  });

  if (existingCommentLike) {
    await Like.findByIdAndUpdate(existingCommentLike._id, {
      $unset: { comment: 1 },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unliked successfully!"));
  }

  const likedComment = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, likedComment, "comment liked successfully!"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
