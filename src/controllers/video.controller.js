import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  /*page will be passed like 1/2/3 
    limit for the number of documents required per page
    sortBy - for sorting it as createdBy
    */

  const { page = 1, limit = 10, query, sortBy, sortType = "createdAt", userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const videos = await Video.find({owner: req.user?._id}).sort(sortBy).limit(limit);
});

//publish a video is done
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title) {
    throw new ApiError(400, "Title is required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoFile = await uploadToCloudinary(videoLocalPath);
  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

  console.log("Video details after uploading to cloudinary:- ", videoFile);

  if (!videoFile) {
    throw new ApiError(400, "Video upload failed");
  }

  //save in database
  const video = await Video.create({
    videoFile: videoFile?.url,
    thumbnail: thumbnail?.url || "",
    duration: videoFile?.duration,
    title,
    description,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

//get a video through it's id is done
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required");
  }

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;
  let thumbnail;

  if (thumbnailLocalPath) {
    thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail?.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required");
  }

  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video status changed successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
