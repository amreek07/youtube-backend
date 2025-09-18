import mongoose , { Schema } from "mongoose";
import { type } from "os";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        maxlength: 300
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);