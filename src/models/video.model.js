import mongoose, {Schema} from "mongoose";
import mongooseAgregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type: String, //Cloudinary urls
            required: true
        },
        thumbnail : {
            type: String, //Cloudinary urls
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, 
    { timestamps: true });

videoSchema.plugin(mongooseAgregatePaginate);

export const Video = mongoose.model('Video', videoSchema);

