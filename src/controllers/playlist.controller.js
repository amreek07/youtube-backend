import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist

  if (!name || name?.trim() == "") {
    throw new ApiError(400, "title of the playlist is required.");
  }
  const playlist = await Playlist.create({
    name,
    description: description?.trim() || "",
    owner: req.user?._id,
  });

  if (!playlist) {
    return res
      .status(500)
      .json(new ApiError(500, "Error occured during creation of playlist"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "valid playlist id is required.");
  }

  //this is a advanced pipeline
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "playlistVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "videoOwner", //this is owner who created this video.
              pipeline: [
                {
                  $project: {
                    username: 1,
                    email: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$videoOwner",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              thumbnail: 1,
              videoFile: 1,
              duration: 1,
              views: 1,
              title: 1,
              videoOwner: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistCreater", //this will return the owner of the playlist
        pipeline: [{ $project: { username: 1, avatar: 1, fullName: 1 } }],
      },
    },
    { $unwind: "$playlistCreater" },
  ]);

  //   const playlist = await Playlist.aggregate([
  //     {
  //       $match: {
  //         _id: new mongoose.Types.ObjectId(playlistId),
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: "videos",
  //         localField: "videos",
  //         foreignField: "_id",
  //         as: "playlistVideos",
  //         pipeline: [
  //           {
  //             $lookup: {
  //               from: "users",
  //               localField: "owner",
  //               foreignField: "_id",
  //               as: "owner",
  //               pipeline: [
  //                 {
  //                   $project: {
  //                     username: 1,
  //                     email: 1,
  //                     avatar: 1,
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //           {
  //             $project: {
  //               thumbnail: 1,
  //               videoFile: 1,
  //               duration: 1,
  //               views: 1,
  //               title: 1,
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $unwind: "$playlistVideos",
  //     },
  //   ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist id is required.");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is required.");
  }
  await Playlist.findByIdAndUpdate(playlistId, {
    //$addToSet push the value in array but avoid duplicates value, if a value is repeating itself then this function performs no operation on the set. on the other hand if use $push method then it allows the duplicate values in the array.
    $addToSet: { videos: videoId },
  });
  const updatedPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "playlistVideos",
        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              duration: 1,
              views: 1,
            },
          },
        ],
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
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Playlist id is required.");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is required.");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "video removed from playlist."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "valid playlist id is required.");
  }
  await Playlist.findByIdAndDelete(playlistId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist delted succesfully."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!name || name?.trim() == "") {
    throw new ApiError(400, "Playlist title is required");
  }
  //TODO: update playlist
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Valid playlist id is required!");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description: description?.trim() || "",
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully."));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
