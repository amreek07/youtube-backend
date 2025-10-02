import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required");
  }


  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner"
    },
    {
      $sort: { createdAt: -1 } //will add the comments in descending order means latest first
    },
    {
      $skip: (pageNum-1)*pageNum
    },
    {
      $limit: (limitNum)
    }
  ]);

  // total count for pagination
  const totalComments = await Comment.countDocuments({
    video: videoId,
  });

  return res.status(200).json(
    new ApiResponse(200, {
      comments,
      pagination: {
        total: totalComments,
        page: pageNum,
        pages: Math.ceil(totalComments / limitNum),
      },
    }, "Comments fetched successfully")
  );

  // return res
  //   .status(201)
  //   .json(new ApiResponse(200, comment, "Comment added successfully"));
});

//done
const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content of comment is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comment) {
    throw new ApiError(400, "Error while adding comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Video id is required");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully!"));
});

//comment delete is successfully implemented
const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(404, "comment not found");
  }

  await Comment.findByIdAndDelete(commentId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
